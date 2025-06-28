# Eric's Places

This project is a personal map application that showcases significant locations in my life, categorized into different types such as home, work, and travel destinations. It's built with React and Mapbox GL, providing an interactive and visually appealing way to explore these places.

## Features

-   **Interactive Map**: Uses Mapbox GL to display a world map.
-   **Categorized Places**: Locations are categorized as:
    -   🏠 **Home**: Places I've lived.
    -   💼 **Work**: Places I've worked.
    -   🎉 **Travel**: Places I've visited for leisure.
    -   ⭐ **Future**: Places I plan to visit.
-   **Pop-up Information**: Clicking on a location marker displays a pop-up with more details about the place.
-   **Dynamic Sizing**: The map automatically adjusts to fit all the markers when the page loads.
-   **Toggleable Layers**: The "Future" locations can be toggled on and off.

## Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **Map**: Mapbox GL, react-map-gl
-   **Backend**: Express.js (for serving the static build)
-   **Deployment**: Configured for Heroku

## Getting Started

### Prerequisites

-   Node.js (v23.x recommended)
-   npm

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/ericbrian/my-places.git
    cd my-places
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```

### Running the Application

1.  **Development Mode**:
    To run the application in development mode with hot-reloading:
    ```sh
    npm run dev
    ```

2.  **Production Mode**:
    To build the application and run the production server:
    ```sh
    # Build the React application
    npm run build

    # Start the Express server
    npm start
    ```
    The application will be available at `http://localhost:3000`.

## Deployment

This application is configured for deployment on [Heroku](https://www.heroku.com/). The `Procfile` specifies the command to start the web server.
