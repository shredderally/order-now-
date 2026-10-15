# MenuBoxGh Premium Analytics Plan

## 1. Objective

Build a private analytics dashboard that helps restaurant owners understand
how customers interact with their digital menus.

The dashboard will be part of the MenuBoxGh Premium offering.

## 2. Analytics Metrics

### Menu Views

Count visits to a restaurant's digital menu.

The dashboard should support daily and weekly summaries.

### Dish Interactions

Track customer interactions with individual dishes.

Potential events include viewing a dish and adding it to the cart.

### WhatsApp Order Attempts

Record when a customer clicks the button to send an order through WhatsApp.

Important: A click does not confirm that the customer completed the order.

Do not report WhatsApp clicks as confirmed sales.

### Popular Dishes

Rank dishes according to recorded interactions.

The dashboard should explain which interaction is being measured,
rather than presenting an ambiguous popularity score.

### Activity Trends

Display analytics over time so restaurant owners can identify changes
in menu traffic and customer activity.

## 3. Planned Dashboard

The dashboard should eventually include:

- Total menu views
- Recorded WhatsApp order attempts
- Dish interaction summaries
- Popular dishes
- Daily and weekly activity charts
- A selectable reporting period

All metrics must come from recorded events.

Do not display invented figures as actual restaurant analytics.

## 4. Database

Supabase will store restaurant information and analytics events.

The initial database schema is located at:

`supabase/schema.sql`

The schema must be reviewed and applied to the intended Supabase project.

## 5. Security

Each restaurant must be associated with an authenticated owner.

Restaurant owners must only access records belonging to restaurants
they own.

Public menu visitors must not receive database secret keys.

Public analytics events should be submitted through a validated ingestion
function rather than unrestricted anonymous database inserts.

The ingestion function should validate event types and restaurant identity
and include appropriate rate limiting.

## 6. Implementation Stages

1. Create and review the database schema.
2. Configure the Supabase project.
3. Implement secure analytics event ingestion.
4. Add tracking to the existing menu.
5. Implement restaurant-owner authentication.
6. Build the analytics dashboard.
7. Enforce and test restaurant-specific data access.
8. Test with real events before releasing the feature.

## 7. Current Status

This document describes the planned implementation.

The dashboard and analytics tracking are not considered operational
until the required database, security, tracking, and dashboard components
have been implemented and tested.
