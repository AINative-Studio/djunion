#!/bin/bash

# Test script for DJ Union Backend API
BASE_URL="http://localhost:3001"

echo "=== DJ Union Backend API Test ==="
echo ""

# Test 1: Register a new user
echo "1. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testdj@example.com",
    "password": "SecurePass123!",
    "name": "Test DJ"
  }')

echo "Response: $REGISTER_RESPONSE"
echo ""

# Test 2: Login
echo "2. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testdj@example.com",
    "password": "SecurePass123!"
  }')

echo "Response: $LOGIN_RESPONSE"
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo ""

# Test 3: Refresh Token
echo "3. Testing Refresh Token..."
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "Response: $REFRESH_RESPONSE"
echo ""

# Test 4: Get user profile (should work with JWT)
echo "4. Testing Get User Profile (requires auth)..."
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/v1/users/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $PROFILE_RESPONSE"
echo ""

# Test 5: List all users (admin only - should fail for DJ role)
echo "5. Testing List All Users (admin only - should fail)..."
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/v1/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $USERS_RESPONSE"
echo ""

# Test 6: Logout
echo "6. Testing Logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/v1/auth/logout" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "Response: $LOGOUT_RESPONSE"
echo ""

echo "=== Test Complete ==="
