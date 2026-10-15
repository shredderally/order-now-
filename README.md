# Order Now | MenuBoxGh

A mobile-first digital restaurant menu with cart functionality and WhatsApp ordering.

Built with HTML, CSS, and JavaScript.

## Features

- Mobile-friendly digital menu
- Restaurant branding and opening hours
- Searchable menu and food categories
- Food images, descriptions, and prices
- Shopping cart and quantity controls
- Dine-in, takeaway, and delivery options
- Order submission through WhatsApp
- Delivery fee calculation

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- WhatsApp Business ordering integration

## Project Structure

    order-now-/
    ├── index.html
    ├── images/
    │   ├── cover.jpg
    │   ├── logo.jpg
    │   ├── jollof.jpg
    │   └── ...
    ├── docs/
    │   └── analytics-plan.md
    ├── supabase/
    │   └── schema.sql
    └── README.md

## Running Locally

Open `index.html` in a browser.

Alternatively, use a local development server such as VS Code Live Server.

## Deployment

The project can be deployed as a static website using Vercel.

Keep `index.html` and the `images/` directory in the project root
so that the existing image paths continue to work.

## Premium Analytics

A restaurant analytics dashboard is planned for the MenuBoxGh Premium offering.

Planned metrics include:
- Menu views
- Dish interactions
- Items added to cart
- WhatsApp order attempts
- Activity trends

Analytics must be connected to a database before real metrics can be displayed.

A WhatsApp click represents an order attempt, not a confirmed sale.

## Security

Never commit database passwords, Supabase secret keys, or service-role keys.

Restaurant owners must only be able to access analytics belonging to
their own restaurants.
