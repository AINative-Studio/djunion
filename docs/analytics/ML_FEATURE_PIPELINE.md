# ML Feature Extraction Pipeline for DJ Union Analytics

**Version:** 1.0
**Date:** October 12, 2025
**Purpose:** Design ML-ready features for listener behavior analysis, content recommendation, and churn prediction

---

## Table of Contents

1. [Overview](#overview)
2. [Feature Engineering Architecture](#feature-engineering-architecture)
3. [Listener Behavior Features](#listener-behavior-features)
4. [Content Recommendation Features](#content-recommendation-features)
5. [Churn Prediction Features](#churn-prediction-features)
6. [Feature Storage & Serving](#feature-storage--serving)
7. [ML Model Pipeline](#ml-model-pipeline)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Overview

The ML feature extraction pipeline transforms raw analytics data into machine learning-ready features for:

1. **Listener Behavior Analysis**: Understanding user engagement patterns
2. **Content Recommendation Engine**: Personalized content suggestions
3. **Churn Prediction**: Identifying users at risk of leaving the platform

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Raw Analytics Data                         │
├─────────────────────────────────────────────────────────────┤
│  Stream Heartbeats │  Playlist Plays │  Podcast Downloads   │
│  User Sessions     │  Track Skips    │  Content Ratings     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Feature Extraction Jobs                      │
├─────────────────────────────────────────────────────────────┤
│  Behavioral Features │  Content Features │ Context Features  │
│  (daily)            │  (weekly)         │  (real-time)      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Feature Store                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL         │  Redis            │  Parquet Files    │
│  (structured)       │  (real-time)      │  (batch ML)       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ML Models                                  │
├─────────────────────────────────────────────────────────────┤
│  Recommendation  │  Churn Prediction │  Content Ranking     │
│  (collaborative) │  (XGBoost)        │  (LightGBM)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature Engineering Architecture

### Feature Categories

#### 1. User-Level Features (Listener Behavior)

**Engagement Metrics**
- `listening_frequency`: Sessions per week
- `avg_session_duration`: Average listening session length (minutes)
- `total_listening_hours`: Total hours listened (last 30 days)
- `session_consistency`: Standard deviation of session times
- `weekend_vs_weekday_ratio`: Weekend listening / weekday listening

**Content Preferences**
- `preferred_content_type`: Stream, playlist, or podcast preference
- `genre_diversity`: Number of unique genres consumed
- `artist_diversity`: Number of unique artists/DJs
- `content_discovery_rate`: New content consumed / total content
- `repeat_listening_rate`: Re-listened content / total content

**Temporal Patterns**
- `preferred_listening_hour`: Peak listening hour (0-23)
- `preferred_day_of_week`: Most active day (0-6)
- `listening_time_variance`: Variance in listening times
- `morning_afternoon_evening_ratio`: Listening distribution by time of day

**Engagement Quality**
- `completion_rate`: Percentage of content finished
- `skip_rate`: Percentage of tracks skipped
- `like_rate`: Percentage of content liked
- `comment_engagement`: Comments per session
- `share_rate`: Shares per session

**Recency Metrics**
- `days_since_registration`: Account age
- `days_since_last_listen`: Recency of last activity
- `days_since_last_subscription`: Subscription recency
- `login_frequency_last_7d`: Logins in last 7 days
- `login_frequency_last_30d`: Logins in last 30 days

#### 2. Content-Level Features (Recommendation)

**Popularity Metrics**
- `total_plays`: Total play count (all-time)
- `plays_last_7d`: Recent play count
- `plays_last_30d`: Monthly play count
- `unique_listeners`: Number of unique listeners
- `listener_growth_rate`: Change in listeners over time
- `viral_coefficient`: Share rate × conversion rate

**Engagement Metrics**
- `avg_completion_rate`: Average percentage played
- `avg_session_duration`: Average listening duration
- `like_rate`: Likes / plays
- `skip_rate`: Skips / plays
- `repeat_listen_rate`: Re-listens / unique listeners

**Content Attributes**
- `genre`: Primary genre
- `subgenre`: Sub-genre classification
- `bpm`: Beats per minute (for music)
- `key`: Musical key (for music)
- `energy`: Energy level (0-1)
- `danceability`: Danceability score (0-1)
- `valence`: Mood positivity (0-1)

**Creator Metrics**
- `creator_follower_count`: Number of DJ/creator followers
- `creator_content_count`: Total content by creator
- `creator_avg_engagement`: Average engagement across creator's content
- `creator_quality_score`: Weighted quality metric

**Temporal Features**
- `days_since_published`: Content age
- `trending_score`: Recent play velocity
- `seasonality_score`: Time-based relevance
- `peak_listening_hour`: When content is most played

#### 3. Context Features (Real-Time)

**Session Context**
- `current_time_of_day`: Hour of day (0-23)
- `current_day_of_week`: Day (0-6)
- `device_type`: Mobile, desktop, smart speaker
- `location`: Geographic region
- `network_quality`: Connection speed tier

**User State**
- `session_length_so_far`: Current session duration
- `tracks_played_in_session`: Count this session
- `last_action_type`: Play, skip, like, share
- `time_since_last_action`: Seconds since last interaction

**Social Context**
- `trending_now`: Currently trending content
- `friends_listening_to`: Content from user's network
- `similar_users_liked`: Collaborative filtering signal

---

## Listener Behavior Features

### Feature Extraction SQL

```sql
-- Extract user behavioral features
CREATE OR REPLACE VIEW user_behavioral_features AS
SELECT
  u.user_id,

  -- Engagement metrics
  COUNT(DISTINCT s.session_id) / 7.0 AS listening_frequency_per_week,
  AVG(s.duration_minutes) AS avg_session_duration,
  SUM(s.duration_minutes) / 60.0 AS total_listening_hours_30d,
  STDDEV(EXTRACT(HOUR FROM s.start_time)) AS session_consistency,

  -- Content preferences
  MODE() WITHIN GROUP (ORDER BY s.content_type) AS preferred_content_type,
  COUNT(DISTINCT c.genre) AS genre_diversity,
  COUNT(DISTINCT c.artist) AS artist_diversity,

  -- Temporal patterns
  MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM s.start_time)) AS preferred_listening_hour,
  MODE() WITHIN GROUP (ORDER BY EXTRACT(DOW FROM s.start_time)) AS preferred_day_of_week,

  -- Engagement quality
  AVG(s.completion_rate) AS avg_completion_rate,
  AVG(s.skip_rate) AS avg_skip_rate,
  COUNT(l.like_id) / COUNT(s.session_id) AS like_rate,

  -- Recency
  EXTRACT(DAY FROM NOW() - u.created_at) AS days_since_registration,
  EXTRACT(DAY FROM NOW() - MAX(s.start_time)) AS days_since_last_listen,
  COUNT(DISTINCT DATE(s.start_time)) FILTER (WHERE s.start_time > NOW() - INTERVAL '7 days') AS login_frequency_last_7d,
  COUNT(DISTINCT DATE(s.start_time)) FILTER (WHERE s.start_time > NOW() - INTERVAL '30 days') AS login_frequency_last_30d

FROM users u
LEFT JOIN listening_sessions s ON u.user_id = s.user_id
  AND s.start_time > NOW() - INTERVAL '30 days'
LEFT JOIN content c ON s.content_id = c.content_id
LEFT JOIN likes l ON u.user_id = l.user_id
  AND l.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.user_id;
```

### Python Feature Extractor

```python
# ml/features/behavioral.py

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List

class BehavioralFeatureExtractor:
    """Extract behavioral features from user analytics data"""

    def __init__(self, db_connection):
        self.db = db_connection

    def extract_user_features(self, user_id: str, lookback_days: int = 30) -> Dict:
        """
        Extract comprehensive behavioral features for a user

        Returns:
            Dictionary of feature_name -> feature_value
        """
        cutoff_date = datetime.now() - timedelta(days=lookback_days)

        # Get user's listening history
        sessions = self._get_user_sessions(user_id, cutoff_date)

        if sessions.empty:
            return self._default_features(user_id)

        features = {
            'user_id': user_id,

            # Engagement metrics
            'listening_frequency_per_week': len(sessions) / (lookback_days / 7),
            'avg_session_duration': sessions['duration_minutes'].mean(),
            'total_listening_hours': sessions['duration_minutes'].sum() / 60,
            'session_consistency': sessions['start_hour'].std(),

            # Content preferences
            'preferred_content_type': sessions['content_type'].mode().iloc[0],
            'genre_diversity': sessions['genre'].nunique(),
            'artist_diversity': sessions['artist'].nunique(),
            'content_discovery_rate': self._calculate_discovery_rate(sessions),
            'repeat_listening_rate': self._calculate_repeat_rate(sessions),

            # Temporal patterns
            'preferred_listening_hour': sessions['start_hour'].mode().iloc[0],
            'preferred_day_of_week': sessions['day_of_week'].mode().iloc[0],
            'listening_time_variance': sessions['start_hour'].var(),
            'morning_afternoon_evening_ratio': self._calculate_time_distribution(sessions),

            # Engagement quality
            'completion_rate': sessions['completion_rate'].mean(),
            'skip_rate': sessions['skip_rate'].mean(),
            'like_rate': self._calculate_like_rate(user_id, cutoff_date),

            # Recency metrics
            'days_since_registration': (datetime.now() - self._get_registration_date(user_id)).days,
            'days_since_last_listen': (datetime.now() - sessions['start_time'].max()).days,
            'login_frequency_last_7d': len(sessions[sessions['start_time'] > datetime.now() - timedelta(days=7)]),
            'login_frequency_last_30d': len(sessions),

            # Churn risk indicators
            'declining_activity': self._detect_activity_decline(sessions),
            'engagement_drop': self._detect_engagement_drop(sessions),
            'subscription_risk': self._calculate_subscription_risk(user_id)
        }

        return features

    def _calculate_discovery_rate(self, sessions: pd.DataFrame) -> float:
        """Calculate rate of new content discovery"""
        total_content = sessions['content_id'].count()
        unique_content = sessions['content_id'].nunique()
        new_content = sessions[sessions['first_listen'] == True]['content_id'].count()

        return new_content / total_content if total_content > 0 else 0.0

    def _calculate_repeat_rate(self, sessions: pd.DataFrame) -> float:
        """Calculate rate of content re-listening"""
        content_counts = sessions.groupby('content_id').size()
        repeat_listens = (content_counts > 1).sum()
        unique_content = content_counts.count()

        return repeat_listens / unique_content if unique_content > 0 else 0.0

    def _calculate_time_distribution(self, sessions: pd.DataFrame) -> Dict:
        """Calculate listening time distribution"""
        morning = sessions[sessions['start_hour'].between(6, 11)].shape[0]
        afternoon = sessions[sessions['start_hour'].between(12, 17)].shape[0]
        evening = sessions[sessions['start_hour'].between(18, 23)].shape[0]
        night = sessions[~sessions['start_hour'].between(6, 23)].shape[0]

        total = len(sessions)

        return {
            'morning': morning / total,
            'afternoon': afternoon / total,
            'evening': evening / total,
            'night': night / total
        }

    def _detect_activity_decline(self, sessions: pd.DataFrame) -> float:
        """
        Detect declining activity pattern

        Returns:
            Score 0-1 (1 = strong decline)
        """
        # Split sessions into two halves
        midpoint = len(sessions) // 2
        first_half = sessions.iloc[:midpoint]
        second_half = sessions.iloc[midpoint:]

        if first_half.empty or second_half.empty:
            return 0.0

        # Compare session frequency
        first_freq = len(first_half) / first_half['start_time'].dt.date.nunique()
        second_freq = len(second_half) / second_half['start_time'].dt.date.nunique()

        decline = max(0, (first_freq - second_freq) / first_freq)

        return min(1.0, decline)

    def _detect_engagement_drop(self, sessions: pd.DataFrame) -> float:
        """
        Detect drop in engagement quality

        Returns:
            Score 0-1 (1 = significant drop)
        """
        # Split into two halves
        midpoint = len(sessions) // 2
        first_half = sessions.iloc[:midpoint]
        second_half = sessions.iloc[midpoint:]

        if first_half.empty or second_half.empty:
            return 0.0

        # Compare engagement metrics
        first_engagement = first_half['completion_rate'].mean()
        second_engagement = second_half['completion_rate'].mean()

        drop = max(0, (first_engagement - second_engagement) / first_engagement)

        return min(1.0, drop)

    def _calculate_subscription_risk(self, user_id: str) -> float:
        """
        Calculate risk of subscription cancellation

        Returns:
            Score 0-1 (1 = high risk)
        """
        subscription = self._get_user_subscription(user_id)

        if not subscription:
            return 0.0  # No subscription, no risk

        risk_factors = []

        # Payment failures
        payment_failures = self._get_payment_failure_count(user_id)
        risk_factors.append(min(1.0, payment_failures / 3))

        # Subscription age (very new or very old = higher risk)
        days_subscribed = (datetime.now() - subscription['created_at']).days
        if days_subscribed < 7:
            risk_factors.append(0.7)  # Trial period risk
        elif days_subscribed > 365:
            risk_factors.append(0.5)  # Longtime subscriber fatigue
        else:
            risk_factors.append(0.2)

        # Support ticket count
        support_tickets = self._get_support_ticket_count(user_id)
        risk_factors.append(min(1.0, support_tickets / 5))

        # Weighted average
        return sum(risk_factors) / len(risk_factors)
```

---

## Content Recommendation Features

### Collaborative Filtering Features

```python
# ml/features/collaborative.py

import pandas as pd
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity

class CollaborativeFeatureExtractor:
    """Extract collaborative filtering features for recommendations"""

    def __init__(self, db_connection):
        self.db = db_connection
        self.user_item_matrix = None
        self.item_similarity_matrix = None

    def build_user_item_matrix(self):
        """Build sparse user-item interaction matrix"""
        # Get all listening history
        query = """
            SELECT user_id, content_id, COUNT(*) as play_count,
                   AVG(completion_rate) as avg_completion
            FROM listening_sessions
            WHERE start_time > NOW() - INTERVAL '90 days'
            GROUP BY user_id, content_id
        """

        interactions = pd.read_sql(query, self.db)

        # Create sparse matrix
        users = interactions['user_id'].astype('category')
        items = interactions['content_id'].astype('category')

        # Weighted interaction score
        interactions['score'] = (
            interactions['play_count'] *
            interactions['avg_completion']
        )

        self.user_item_matrix = csr_matrix(
            (interactions['score'],
             (users.cat.codes, items.cat.codes))
        )

        self.user_mapping = dict(enumerate(users.cat.categories))
        self.item_mapping = dict(enumerate(items.cat.categories))

    def compute_item_similarity(self):
        """Compute item-item similarity matrix"""
        self.item_similarity_matrix = cosine_similarity(
            self.user_item_matrix.T,
            dense_output=False
        )

    def get_similar_items(self, content_id: str, top_k: int = 10) -> List[Dict]:
        """Get most similar items based on collaborative filtering"""
        if self.item_similarity_matrix is None:
            self.compute_item_similarity()

        # Get item index
        item_idx = next(
            (k for k, v in self.item_mapping.items() if v == content_id),
            None
        )

        if item_idx is None:
            return []

        # Get similarity scores
        similarities = self.item_similarity_matrix[item_idx].toarray()[0]

        # Get top-K similar items (excluding self)
        similar_indices = np.argsort(similarities)[::-1][1:top_k+1]

        recommendations = []
        for idx in similar_indices:
            recommendations.append({
                'content_id': self.item_mapping[idx],
                'similarity_score': similarities[idx]
            })

        return recommendations

    def get_user_recommendations(self, user_id: str, top_k: int = 10) -> List[Dict]:
        """Get personalized recommendations for user"""
        # Get user index
        user_idx = next(
            (k for k, v in self.user_mapping.items() if v == user_id),
            None
        )

        if user_idx is None:
            return self._get_popular_items(top_k)

        # Get user's listening history
        user_items = self.user_item_matrix[user_idx].toarray()[0]
        listened_items = np.where(user_items > 0)[0]

        # Calculate predicted scores for all items
        predicted_scores = np.zeros(self.user_item_matrix.shape[1])

        for item_idx in listened_items:
            # Get similar items
            similarities = self.item_similarity_matrix[item_idx].toarray()[0]

            # Weighted sum
            predicted_scores += similarities * user_items[item_idx]

        # Remove already listened items
        predicted_scores[listened_items] = -1

        # Get top-K recommendations
        top_indices = np.argsort(predicted_scores)[::-1][:top_k]

        recommendations = []
        for idx in top_indices:
            if predicted_scores[idx] > 0:
                recommendations.append({
                    'content_id': self.item_mapping[idx],
                    'predicted_score': predicted_scores[idx]
                })

        return recommendations
```

---

## Churn Prediction Features

### Feature Extraction for Churn Model

```python
# ml/features/churn.py

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler

class ChurnFeatureExtractor:
    """Extract features for churn prediction model"""

    def __init__(self, db_connection):
        self.db = db_connection
        self.scaler = StandardScaler()

    def extract_churn_features(self, user_id: str) -> Dict:
        """
        Extract comprehensive churn prediction features

        Returns:
            Feature dictionary ready for ML model
        """
        features = {
            # Activity features
            **self._extract_activity_features(user_id),

            # Engagement features
            **self._extract_engagement_features(user_id),

            # Monetary features
            **self._extract_monetary_features(user_id),

            # Social features
            **self._extract_social_features(user_id),

            # Technical features
            **self._extract_technical_features(user_id),

            # Temporal features
            **self._extract_temporal_features(user_id)
        }

        return features

    def _extract_activity_features(self, user_id: str) -> Dict:
        """Activity-based churn indicators"""
        query = """
            SELECT
                COUNT(DISTINCT DATE(start_time)) as active_days_last_30d,
                COUNT(*) as total_sessions_last_30d,
                AVG(duration_minutes) as avg_session_duration,
                MAX(start_time) as last_activity_date
            FROM listening_sessions
            WHERE user_id = %s
              AND start_time > NOW() - INTERVAL '30 days'
        """

        result = pd.read_sql(query, self.db, params=[user_id])

        return {
            'active_days_last_30d': result['active_days_last_30d'].iloc[0],
            'total_sessions_last_30d': result['total_sessions_last_30d'].iloc[0],
            'avg_session_duration': result['avg_session_duration'].iloc[0],
            'days_since_last_activity': (
                datetime.now() - result['last_activity_date'].iloc[0]
            ).days
        }

    def _extract_engagement_features(self, user_id: str) -> Dict:
        """Engagement quality indicators"""
        query = """
            SELECT
                AVG(completion_rate) as avg_completion_rate,
                AVG(skip_rate) as avg_skip_rate,
                COUNT(DISTINCT content_id) as unique_content_count,
                COUNT(*) FILTER (WHERE completion_rate > 0.8) / COUNT(*) as high_completion_ratio
            FROM listening_sessions
            WHERE user_id = %s
              AND start_time > NOW() - INTERVAL '30 days'
        """

        result = pd.read_sql(query, self.db, params=[user_id])

        return {
            'avg_completion_rate': result['avg_completion_rate'].iloc[0],
            'avg_skip_rate': result['avg_skip_rate'].iloc[0],
            'unique_content_count': result['unique_content_count'].iloc[0],
            'high_completion_ratio': result['high_completion_ratio'].iloc[0]
        }

    def _extract_monetary_features(self, user_id: str) -> Dict:
        """Subscription and payment indicators"""
        query = """
            SELECT
                s.status as subscription_status,
                s.plan_id,
                EXTRACT(DAY FROM NOW() - s.created_at) as days_subscribed,
                COUNT(p.payment_id) FILTER (WHERE p.status = 'failed') as payment_failures,
                COUNT(p.payment_id) FILTER (WHERE p.status = 'succeeded') as successful_payments
            FROM subscriptions s
            LEFT JOIN payments p ON s.subscription_id = p.subscription_id
              AND p.created_at > NOW() - INTERVAL '90 days'
            WHERE s.user_id = %s
            GROUP BY s.subscription_id, s.status, s.plan_id, s.created_at
        """

        result = pd.read_sql(query, self.db, params=[user_id])

        if result.empty:
            return {
                'has_subscription': 0,
                'days_subscribed': 0,
                'payment_failures': 0,
                'successful_payments': 0
            }

        return {
            'has_subscription': 1,
            'days_subscribed': result['days_subscribed'].iloc[0],
            'payment_failures': result['payment_failures'].iloc[0],
            'successful_payments': result['successful_payments'].iloc[0],
            'subscription_status': result['subscription_status'].iloc[0]
        }

    def train_churn_model(self, training_data: pd.DataFrame, labels: pd.Series):
        """
        Train XGBoost churn prediction model

        Args:
            training_data: Feature matrix
            labels: Binary churn labels (1 = churned, 0 = active)
        """
        import xgboost as xgb

        # Scale features
        X_scaled = self.scaler.fit_transform(training_data)

        # Train XGBoost model
        self.model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            objective='binary:logistic',
            eval_metric='auc'
        )

        self.model.fit(X_scaled, labels)

    def predict_churn_probability(self, user_id: str) -> float:
        """
        Predict churn probability for user

        Returns:
            Probability score (0-1)
        """
        features = self.extract_churn_features(user_id)
        feature_vector = pd.DataFrame([features])

        # Scale features
        X_scaled = self.scaler.transform(feature_vector)

        # Predict probability
        churn_prob = self.model.predict_proba(X_scaled)[0][1]

        return churn_prob
```

---

## Feature Storage & Serving

### Feature Store Schema

```sql
-- Create feature store tables

-- User features (updated daily)
CREATE TABLE ml_user_features (
  user_id UUID PRIMARY KEY,
  feature_vector JSONB NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version VARCHAR(10) NOT NULL DEFAULT 'v1'
);

CREATE INDEX idx_ml_user_features_computed ON ml_user_features(computed_at DESC);

-- Content features (updated weekly)
CREATE TABLE ml_content_features (
  content_id UUID PRIMARY KEY,
  content_type VARCHAR(20) NOT NULL,
  feature_vector JSONB NOT NULL,
  popularity_score NUMERIC,
  quality_score NUMERIC,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version VARCHAR(10) NOT NULL DEFAULT 'v1'
);

CREATE INDEX idx_ml_content_features_popularity ON ml_content_features(popularity_score DESC);

-- Pre-computed recommendations (refreshed daily)
CREATE TABLE ml_recommendations (
  recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  recommendation_type VARCHAR(50) NOT NULL,
  score NUMERIC NOT NULL,
  reason TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, content_id, recommendation_type)
);

CREATE INDEX idx_ml_recommendations_user_score ON ml_recommendations(user_id, score DESC);
CREATE INDEX idx_ml_recommendations_expires ON ml_recommendations(expires_at);

-- Churn predictions (updated daily)
CREATE TABLE ml_churn_predictions (
  user_id UUID PRIMARY KEY,
  churn_probability NUMERIC NOT NULL,
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  predicted_churn_date DATE,
  features_used JSONB,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ml_churn_high_risk ON ml_churn_predictions(churn_probability DESC)
  WHERE risk_level IN ('high', 'critical');
```

### Feature Serving API

```python
# ml/feature_server.py

from fastapi import FastAPI, HTTPException
from typing import Dict, List
import redis
import json

app = FastAPI()

# Redis client for real-time feature serving
redis_client = redis.Redis(host='localhost', port=6379, db=0)

@app.get("/features/user/{user_id}")
async def get_user_features(user_id: str) -> Dict:
    """Get user features for ML models"""

    # Try Redis cache first
    cached = redis_client.get(f"user_features:{user_id}")
    if cached:
        return json.loads(cached)

    # Fall back to database
    features = extract_user_features_from_db(user_id)

    # Cache for 1 hour
    redis_client.setex(
        f"user_features:{user_id}",
        3600,
        json.dumps(features)
    )

    return features

@app.get("/recommendations/{user_id}")
async def get_recommendations(user_id: str, top_k: int = 10) -> List[Dict]:
    """Get personalized recommendations"""

    # Check if recommendations are pre-computed
    cached = redis_client.get(f"recommendations:{user_id}")
    if cached:
        recs = json.loads(cached)
        return recs[:top_k]

    # Generate recommendations on-the-fly
    recs = generate_recommendations(user_id, top_k)

    # Cache for 6 hours
    redis_client.setex(
        f"recommendations:{user_id}",
        21600,
        json.dumps(recs)
    )

    return recs

@app.get("/churn-risk/{user_id}")
async def get_churn_risk(user_id: str) -> Dict:
    """Get churn risk prediction"""

    # Get from database (updated daily)
    query = """
        SELECT churn_probability, risk_level, predicted_churn_date
        FROM ml_churn_predictions
        WHERE user_id = %s
    """

    result = db.execute(query, [user_id])

    if not result:
        raise HTTPException(status_code=404, detail="Churn prediction not found")

    return {
        'user_id': user_id,
        'churn_probability': result['churn_probability'],
        'risk_level': result['risk_level'],
        'predicted_churn_date': result['predicted_churn_date']
    }
```

---

## ML Model Pipeline

### Training Pipeline

```python
# ml/training_pipeline.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_recall_curve
import mlflow
import xgboost as xgb

class MLTrainingPipeline:
    """End-to-end ML model training pipeline"""

    def __init__(self, experiment_name: str):
        mlflow.set_experiment(experiment_name)
        self.experiment_name = experiment_name

    def train_churn_model(self):
        """Train churn prediction model"""

        with mlflow.start_run(run_name="churn_prediction"):
            # 1. Load training data
            features, labels = self.load_churn_training_data()

            # 2. Split data
            X_train, X_test, y_train, y_test = train_test_split(
                features, labels, test_size=0.2, random_state=42, stratify=labels
            )

            # 3. Train model
            model = xgb.XGBClassifier(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                scale_pos_weight=3,  # Handle class imbalance
                objective='binary:logistic',
                eval_metric='auc'
            )

            model.fit(
                X_train, y_train,
                eval_set=[(X_test, y_test)],
                early_stopping_rounds=10,
                verbose=True
            )

            # 4. Evaluate model
            y_pred_proba = model.predict_proba(X_test)[:, 1]
            auc_score = roc_auc_score(y_test, y_pred_proba)

            # Log metrics
            mlflow.log_metric("auc", auc_score)
            mlflow.log_metric("train_samples", len(X_train))
            mlflow.log_metric("test_samples", len(X_test))

            # 5. Save model
            mlflow.xgboost.log_model(model, "churn_model")

            # 6. Feature importance
            feature_importance = pd.DataFrame({
                'feature': features.columns,
                'importance': model.feature_importances_
            }).sort_values('importance', ascending=False)

            mlflow.log_table(feature_importance, "feature_importance.json")

            print(f"Churn model trained. AUC: {auc_score:.4f}")

            return model

    def train_recommendation_model(self):
        """Train collaborative filtering recommendation model"""

        with mlflow.start_run(run_name="recommendation_cf"):
            # Implementation using matrix factorization or neural collaborative filtering
            pass
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Set up feature store database tables
- Implement basic feature extraction jobs
- Create feature serving API endpoints

### Phase 2: Behavioral Features (Weeks 3-4)
- Implement user behavioral feature extraction
- Set up daily feature refresh jobs
- Build feature monitoring dashboard

### Phase 3: Recommendation System (Weeks 5-7)
- Implement collaborative filtering
- Build content-based features
- Deploy recommendation API

### Phase 4: Churn Prediction (Weeks 8-10)
- Extract churn features
- Train XGBoost churn model
- Implement churn risk API
- Create intervention workflows

### Phase 5: Production Optimization (Weeks 11-12)
- Optimize feature computation performance
- Implement A/B testing framework
- Set up model monitoring and retraining

---

**Document Version:** 1.0
**Last Updated:** October 12, 2025
**Status:** Design Complete - Ready for Implementation
