/**
 * Analytics Service
 * Business logic for analytics data processing and aggregation
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Analytics } from './entities/analytics.entity';
import { StreamHeartbeat } from './entities/stream-heartbeat.entity';
import { PlaylistPlay } from './entities/playlist-play.entity';
import { PodcastDownload } from './entities/podcast-download.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Analytics)
    private analyticsRepo: Repository<Analytics>,
    @InjectRepository(StreamHeartbeat)
    private heartbeatsRepo: Repository<StreamHeartbeat>,
    @InjectRepository(PlaylistPlay)
    private playsRepo: Repository<PlaylistPlay>,
    @InjectRepository(PodcastDownload)
    private downloadsRepo: Repository<PodcastDownload>,
    @InjectRedis()
    private readonly redis: Redis
  ) {}

  /**
   * Get stream analytics for a date range
   */
  async getStreamAnalytics(
    streamId: string,
    fromDate: Date,
    toDate: Date,
    interval: string = 'day'
  ) {
    // Get aggregated data from analytics table
    const timeseries = await this.analyticsRepo
      .createQueryBuilder('a')
      .select('a.date', 'date')
      .addSelect('SUM(CASE WHEN a.metric = :listeners THEN a.value ELSE 0 END)', 'listeners')
      .addSelect('MAX(CASE WHEN a.metric = :peak THEN a.value ELSE 0 END)', 'peak')
      .addSelect('SUM(CASE WHEN a.metric = :uptime THEN a.value ELSE 0 END)', 'uptime_seconds')
      .where('a.resource_type = :type', { type: 'stream' })
      .andWhere('a.resource_id = :id', { id: streamId })
      .andWhere('a.date >= :from', { from: fromDate })
      .andWhere('a.date <= :to', { to: toDate })
      .setParameters({
        listeners: 'listeners',
        peak: 'peak_listeners',
        uptime: 'uptime_seconds'
      })
      .groupBy('a.date')
      .orderBy('a.date', 'ASC')
      .getRawMany();

    // Calculate summary statistics
    const summary = {
      total_listeners: timeseries.reduce((sum, d) => sum + parseInt(d.listeners), 0),
      peak_listeners: Math.max(...timeseries.map(d => parseInt(d.peak))),
      avg_listeners: Math.round(
        timeseries.reduce((sum, d) => sum + parseInt(d.listeners), 0) /
        (timeseries.length || 1)
      ),
      total_uptime_hours: Math.round(
        timeseries.reduce((sum, d) => sum + parseInt(d.uptime_seconds), 0) / 3600
      ),
      uptime_percentage: parseFloat(
        (
          (timeseries.reduce((sum, d) => sum + parseInt(d.uptime_seconds), 0) /
           (timeseries.length * 86400)) * 100
        ).toFixed(2)
      )
    };

    // Get real-time data from Redis
    const realtime = await this.getRealtimeStreamMetrics(streamId);

    return {
      stream_id: streamId,
      date_range: {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0]
      },
      summary,
      timeseries: timeseries.map(d => ({
        date: d.date,
        listeners: parseInt(d.listeners),
        peak: parseInt(d.peak),
        uptime_seconds: parseInt(d.uptime_seconds)
      })),
      real_time: realtime
    };
  }

  /**
   * Get playlist analytics for a date range
   */
  async getPlaylistAnalytics(
    playlistId: string,
    fromDate: Date,
    toDate: Date
  ) {
    // Get aggregated play counts
    const timeseries = await this.analyticsRepo
      .createQueryBuilder('a')
      .select('a.date', 'date')
      .addSelect('SUM(CASE WHEN a.metric = :plays THEN a.value ELSE 0 END)', 'play_count')
      .addSelect('COUNT(DISTINCT CASE WHEN a.metric = :unique THEN a.value END)', 'unique_listeners')
      .where('a.resource_type = :type', { type: 'playlist' })
      .andWhere('a.resource_id = :id', { id: playlistId })
      .andWhere('a.date >= :from', { from: fromDate })
      .andWhere('a.date <= :to', { to: toDate })
      .setParameters({
        plays: 'play_count',
        unique: 'unique_listeners'
      })
      .groupBy('a.date')
      .orderBy('a.date', 'ASC')
      .getRawMany();

    // Get top tracks
    const topTracks = await this.playsRepo
      .createQueryBuilder('p')
      .select('p.track_id', 'track_id')
      .addSelect('COUNT(*)', 'play_count')
      .where('p.playlist_id = :id', { id: playlistId })
      .andWhere('p.played_at >= :from', { from: fromDate })
      .andWhere('p.played_at <= :to', { to: toDate })
      .groupBy('p.track_id')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    const summary = {
      total_plays: timeseries.reduce((sum, d) => sum + parseInt(d.play_count), 0),
      unique_listeners: Math.max(...timeseries.map(d => parseInt(d.unique_listeners))),
      avg_plays_per_day: Math.round(
        timeseries.reduce((sum, d) => sum + parseInt(d.play_count), 0) /
        (timeseries.length || 1)
      )
    };

    return {
      playlist_id: playlistId,
      date_range: {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0]
      },
      summary,
      timeseries: timeseries.map(d => ({
        date: d.date,
        play_count: parseInt(d.play_count),
        unique_listeners: parseInt(d.unique_listeners)
      })),
      top_tracks: topTracks.map(t => ({
        track_id: t.track_id,
        play_count: parseInt(t.play_count)
      }))
    };
  }

  /**
   * Get podcast analytics for a date range
   */
  async getPodcastAnalytics(
    podcastId: string,
    fromDate: Date,
    toDate: Date
  ) {
    // Get aggregated download counts
    const timeseries = await this.analyticsRepo
      .createQueryBuilder('a')
      .select('a.date', 'date')
      .addSelect('SUM(CASE WHEN a.metric = :downloads THEN a.value ELSE 0 END)', 'downloads')
      .addSelect('COUNT(DISTINCT CASE WHEN a.metric = :subs THEN a.value END)', 'subscribers')
      .where('a.resource_type = :type', { type: 'podcast' })
      .andWhere('a.resource_id = :id', { id: podcastId })
      .andWhere('a.date >= :from', { from: fromDate })
      .andWhere('a.date <= :to', { to: toDate })
      .setParameters({
        downloads: 'downloads',
        subs: 'subscribers'
      })
      .groupBy('a.date')
      .orderBy('a.date', 'ASC')
      .getRawMany();

    // Get episode-level analytics
    const episodes = await this.downloadsRepo
      .createQueryBuilder('d')
      .select('d.episode_id', 'episode_id')
      .addSelect('COUNT(*)', 'downloads')
      .where('d.podcast_id = :id', { id: podcastId })
      .andWhere('d.downloaded_at >= :from', { from: fromDate })
      .andWhere('d.downloaded_at <= :to', { to: toDate })
      .groupBy('d.episode_id')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    const summary = {
      total_downloads: timeseries.reduce((sum, d) => sum + parseInt(d.downloads), 0),
      total_subscribers: Math.max(...timeseries.map(d => parseInt(d.subscribers))),
      avg_downloads_per_day: Math.round(
        timeseries.reduce((sum, d) => sum + parseInt(d.downloads), 0) /
        (timeseries.length || 1)
      ),
      total_episodes: episodes.length
    };

    return {
      podcast_id: podcastId,
      date_range: {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0]
      },
      summary,
      timeseries: timeseries.map(d => ({
        date: d.date,
        downloads: parseInt(d.downloads),
        subscribers: parseInt(d.subscribers)
      })),
      episodes: episodes.map(e => ({
        episode_id: e.episode_id,
        downloads: parseInt(e.downloads)
      }))
    };
  }

  /**
   * Get dashboard analytics for a user
   */
  async getDashboardAnalytics(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    // Get user's resources (this would come from respective services)
    // For now, return mock structure

    return {
      user_id: userId,
      summary: {
        total_streams: 0, // Would query streams service
        active_streams: 0,
        total_listeners_today: 0,
        total_playlists: 0,
        total_plays_today: 0,
        total_podcasts: 0,
        total_downloads_today: 0
      },
      top_streams: [],
      recent_activity: []
    };
  }

  /**
   * Get real-time stream metrics from Redis
   */
  async getRealtimeStreamMetrics(streamId: string) {
    const data = await this.redis.hgetall(`stream:${streamId}:realtime`);

    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    const lastSeen = parseInt(data.last_seen || '0');
    const isOnline = lastSeen && (Date.now() - lastSeen) < 60000; // Online if heartbeat within 1 minute

    return {
      current_listeners: parseInt(data.listener_count || '0'),
      current_track: data.current_track || 'Unknown',
      bitrate: parseInt(data.bitrate || '0'),
      uptime_seconds: parseInt(data.uptime_seconds || '0'),
      status: isOnline ? 'online' : 'offline',
      last_heartbeat: new Date(lastSeen).toISOString()
    };
  }

  /**
   * Record stream heartbeat
   */
  async recordStreamHeartbeat(
    streamId: string,
    data: {
      listener_count: number;
      bitrate: number;
      uptime_seconds: number;
      current_track: string;
    }
  ) {
    const now = Date.now();

    // Update Redis cache (real-time)
    await this.redis.hset(`stream:${streamId}:realtime`, {
      listener_count: data.listener_count,
      bitrate: data.bitrate,
      uptime_seconds: data.uptime_seconds,
      current_track: data.current_track,
      last_seen: now
    });

    // Set TTL of 5 minutes
    await this.redis.expire(`stream:${streamId}:realtime`, 300);

    // Append to Redis stream for processing
    await this.redis.xadd(
      'stream:heartbeats',
      '*',
      'stream_id', streamId,
      'listener_count', data.listener_count.toString(),
      'timestamp', now.toString()
    );

    // Store in TimescaleDB for historical analysis
    await this.heartbeatsRepo.insert({
      stream_id: streamId,
      listener_count: data.listener_count,
      bitrate: data.bitrate,
      uptime_seconds: data.uptime_seconds,
      current_track: data.current_track,
      created_at: new Date()
    });

    this.logger.debug(`Heartbeat recorded for stream ${streamId}: ${data.listener_count} listeners`);

    return { status: 'recorded', next_heartbeat_in: 30 };
  }

  /**
   * Record playlist play event
   */
  async recordPlaylistPlay(data: {
    playlist_id: string;
    track_id?: string;
    user_id?: string;
    ip_address: string;
    user_agent: string;
  }) {
    await this.playsRepo.insert({
      playlist_id: data.playlist_id,
      track_id: data.track_id,
      user_id: data.user_id,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      played_at: new Date()
    });

    // Increment real-time counter in Redis
    await this.redis.hincrby(`playlist:${data.playlist_id}:stats`, 'play_count', 1);

    this.logger.debug(`Play recorded for playlist ${data.playlist_id}`);
  }

  /**
   * Record podcast download event
   */
  async recordPodcastDownload(data: {
    podcast_id: string;
    episode_id: string;
    user_id?: string;
    ip_address: string;
    user_agent: string;
  }) {
    await this.downloadsRepo.insert({
      podcast_id: data.podcast_id,
      episode_id: data.episode_id,
      user_id: data.user_id,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      downloaded_at: new Date()
    });

    // Increment real-time counter in Redis
    await this.redis.hincrby(`podcast:${data.podcast_id}:stats`, 'downloads', 1);

    this.logger.debug(`Download recorded for podcast ${data.podcast_id}, episode ${data.episode_id}`);
  }

  /**
   * Record custom analytics event
   */
  async recordEvent(event: {
    event_type: string;
    resource_type: string;
    resource_id: string;
    user_id: string;
    ip_address: string;
    user_agent: string;
    metadata?: Record<string, any>;
    timestamp: Date;
  }) {
    // Store in events table for future analysis
    this.logger.debug(`Event recorded: ${event.event_type} for ${event.resource_type}:${event.resource_id}`);

    // Could store in a separate events table or Elasticsearch for advanced analytics
  }

  /**
   * Export stream analytics as CSV
   */
  async exportStreamAnalyticsCSV(
    streamId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<string> {
    const analytics = await this.getStreamAnalytics(streamId, fromDate, toDate);

    // Generate CSV
    const headers = 'Date,Listeners,Peak Listeners,Uptime (seconds)\n';
    const rows = analytics.timeseries
      .map(d => `${d.date},${d.listeners},${d.peak},${d.uptime_seconds}`)
      .join('\n');

    return headers + rows;
  }

  /**
   * Daily aggregation job (called by cron)
   */
  async runDailyAggregation() {
    this.logger.log('Starting daily analytics aggregation...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().split('T')[0];

    // Aggregate stream heartbeats
    await this.aggregateStreamMetrics(new Date(date));

    // Aggregate playlist plays
    await this.aggregatePlaylistMetrics(new Date(date));

    // Aggregate podcast downloads
    await this.aggregatePodcastMetrics(new Date(date));

    // Purge old raw events (keep 30 days)
    await this.purgeOldEvents();

    this.logger.log('Daily analytics aggregation completed');
  }

  private async aggregateStreamMetrics(date: Date) {
    // Sum daily listeners
    const listenerSum = await this.heartbeatsRepo
      .createQueryBuilder('h')
      .select('h.stream_id', 'stream_id')
      .addSelect('SUM(h.listener_count)', 'total_listeners')
      .where('DATE(h.created_at) = :date', { date: date.toISOString().split('T')[0] })
      .groupBy('h.stream_id')
      .getRawMany();

    for (const row of listenerSum) {
      await this.analyticsRepo.upsert(
        {
          resource_type: 'stream',
          resource_id: row.stream_id,
          date: date,
          metric: 'listeners',
          value: parseInt(row.total_listeners)
        },
        ['resource_type', 'resource_id', 'date', 'metric']
      );
    }

    // Calculate peak listeners
    const peakListeners = await this.heartbeatsRepo
      .createQueryBuilder('h')
      .select('h.stream_id', 'stream_id')
      .addSelect('MAX(h.listener_count)', 'peak_listeners')
      .where('DATE(h.created_at) = :date', { date: date.toISOString().split('T')[0] })
      .groupBy('h.stream_id')
      .getRawMany();

    for (const row of peakListeners) {
      await this.analyticsRepo.upsert(
        {
          resource_type: 'stream',
          resource_id: row.stream_id,
          date: date,
          metric: 'peak_listeners',
          value: parseInt(row.peak_listeners)
        },
        ['resource_type', 'resource_id', 'date', 'metric']
      );
    }

    this.logger.debug(`Aggregated stream metrics for ${date.toISOString().split('T')[0]}`);
  }

  private async aggregatePlaylistMetrics(date: Date) {
    const playCounts = await this.playsRepo
      .createQueryBuilder('p')
      .select('p.playlist_id', 'playlist_id')
      .addSelect('COUNT(*)', 'play_count')
      .where('DATE(p.played_at) = :date', { date: date.toISOString().split('T')[0] })
      .groupBy('p.playlist_id')
      .getRawMany();

    for (const row of playCounts) {
      await this.analyticsRepo.upsert(
        {
          resource_type: 'playlist',
          resource_id: row.playlist_id,
          date: date,
          metric: 'play_count',
          value: parseInt(row.play_count)
        },
        ['resource_type', 'resource_id', 'date', 'metric']
      );
    }

    this.logger.debug(`Aggregated playlist metrics for ${date.toISOString().split('T')[0]}`);
  }

  private async aggregatePodcastMetrics(date: Date) {
    const downloadCounts = await this.downloadsRepo
      .createQueryBuilder('d')
      .select('d.podcast_id', 'podcast_id')
      .addSelect('COUNT(*)', 'downloads')
      .where('DATE(d.downloaded_at) = :date', { date: date.toISOString().split('T')[0] })
      .groupBy('d.podcast_id')
      .getRawMany();

    for (const row of downloadCounts) {
      await this.analyticsRepo.upsert(
        {
          resource_type: 'podcast',
          resource_id: row.podcast_id,
          date: date,
          metric: 'downloads',
          value: parseInt(row.downloads)
        },
        ['resource_type', 'resource_id', 'date', 'metric']
      );
    }

    this.logger.debug(`Aggregated podcast metrics for ${date.toISOString().split('T')[0]}`);
  }

  private async purgeOldEvents() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    await this.heartbeatsRepo
      .createQueryBuilder()
      .delete()
      .where('created_at < :cutoff', { cutoff: cutoffDate })
      .execute();

    await this.playsRepo
      .createQueryBuilder()
      .delete()
      .where('played_at < :cutoff', { cutoff: cutoffDate })
      .execute();

    await this.downloadsRepo
      .createQueryBuilder()
      .delete()
      .where('downloaded_at < :cutoff', { cutoff: cutoffDate })
      .execute();

    this.logger.debug(`Purged events older than ${cutoffDate.toISOString()}`);
  }
}
