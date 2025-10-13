/**
 * Analytics Controller
 * Handles all analytics-related HTTP endpoints
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('v1/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /v1/analytics/streams/:id
   * Get analytics for a specific stream
   */
  @Get('streams/:id')
  async getStreamAnalytics(
    @Param('id') streamId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('interval') interval: string = 'day'
  ) {
    // Validate date range
    if (!from || !to) {
      throw new BadRequestException('Missing required query parameters: from, to');
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    if (toDate < fromDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const analytics = await this.analyticsService.getStreamAnalytics(
      streamId,
      fromDate,
      toDate,
      interval
    );

    if (!analytics) {
      throw new NotFoundException(`Stream with ID ${streamId} not found`);
    }

    return analytics;
  }

  /**
   * GET /v1/analytics/playlists/:id
   * Get analytics for a specific playlist
   */
  @Get('playlists/:id')
  async getPlaylistAnalytics(
    @Param('id') playlistId: string,
    @Query('from') from: string,
    @Query('to') to: string
  ) {
    if (!from || !to) {
      throw new BadRequestException('Missing required query parameters: from, to');
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    const analytics = await this.analyticsService.getPlaylistAnalytics(
      playlistId,
      fromDate,
      toDate
    );

    if (!analytics) {
      throw new NotFoundException(`Playlist with ID ${playlistId} not found`);
    }

    return analytics;
  }

  /**
   * GET /v1/analytics/podcasts/:id
   * Get analytics for a specific podcast
   */
  @Get('podcasts/:id')
  async getPodcastAnalytics(
    @Param('id') podcastId: string,
    @Query('from') from: string,
    @Query('to') to: string
  ) {
    if (!from || !to) {
      throw new BadRequestException('Missing required query parameters: from, to');
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    const analytics = await this.analyticsService.getPodcastAnalytics(
      podcastId,
      fromDate,
      toDate
    );

    if (!analytics) {
      throw new NotFoundException(`Podcast with ID ${podcastId} not found`);
    }

    return analytics;
  }

  /**
   * GET /v1/analytics/dashboard
   * Get aggregated analytics for user's dashboard
   */
  @Get('dashboard')
  async getDashboardAnalytics(@Req() req: Request) {
    const userId = req.user['sub']; // Extract user ID from JWT

    const dashboard = await this.analyticsService.getDashboardAnalytics(userId);

    return dashboard;
  }

  /**
   * POST /v1/analytics/events
   * Record a custom analytics event (for frontend tracking)
   */
  @Post('events')
  async recordEvent(
    @Body() event: {
      event_type: string;
      resource_type: string;
      resource_id: string;
      metadata?: Record<string, any>;
    },
    @Req() req: Request
  ) {
    const userId = req.user['sub'];
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    await this.analyticsService.recordEvent({
      ...event,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date()
    });

    return { status: 'recorded' };
  }

  /**
   * GET /v1/analytics/realtime/streams/:id
   * Get real-time metrics for a stream (from Redis)
   */
  @Get('realtime/streams/:id')
  async getRealtimeStreamMetrics(@Param('id') streamId: string) {
    const metrics = await this.analyticsService.getRealtimeStreamMetrics(streamId);

    if (!metrics) {
      throw new NotFoundException(`No real-time data found for stream ${streamId}`);
    }

    return metrics;
  }

  /**
   * GET /v1/analytics/export/streams/:id
   * Export stream analytics as CSV
   */
  @Get('export/streams/:id')
  async exportStreamAnalytics(
    @Param('id') streamId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Req() req: Request
  ) {
    if (!from || !to) {
      throw new BadRequestException('Missing required query parameters: from, to');
    }

    const csv = await this.analyticsService.exportStreamAnalyticsCSV(
      streamId,
      new Date(from),
      new Date(to)
    );

    return csv;
  }
}
