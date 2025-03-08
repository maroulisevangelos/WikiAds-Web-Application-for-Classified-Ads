# WikiAds-Web-Application-for-Classified-Ads
This project implements a web application for a classified ads service, WikiAds, using a combination of HTML, CSS, JavaScript, Node.js, and Express. The application supports user authentication, navigation through categories and subcategories of ads, adding ads to favorites, and viewing favorite ads. It also includes a filtering feature for ads based on subcategories.

Features:

Phase 1: Basic Functionality

    Navigation through Categories and Subcategories of Ads:
    
      Users can navigate through different categories of ads, each displaying a list of subcategories.
      
      Each category and subcategory is represented with a title and an image.
    
    Category and Subcategory Pages:
    
      The category page (category.html) displays all ads belonging to that category, including title, description, first image, and price.
      
      The subcategory page (subcategory.html) provides detailed information on ads belonging to that subcategory, including all images and a feature table.

Phase 2: Enhanced Functionality

    User Authentication:
    
      Users must log in to add ads to their favorites.
      
      Login is handled via a form on the category.html page using the Fetch API to call a Login Service (LS).
      
      The LS returns a unique sessionId for successful authentication.
    
    Adding Ads to Favorites:
    
      Authenticated users can add ads to their favorites by clicking an "Add to Favorites" button on the category.html page.
      
      This action calls the Add to Favorites Service (AFS) with necessary ad details and the user's sessionId.
    
    Viewing Favorite Ads:
    
      The favorite-ads.html page displays the favorite ads of a logged-in user.
      
      The page retrieves the list of favorite ads from the Favorites Retrieval Service (FRS) using the user's sessionId and username.
    
    Filtering Ads by Subcategory (Bonus 1):
    
      The category.html page includes a filtering feature that allows users to filter ads based on subcategories.
      
      A sidebar with links or radio buttons representing subcategories enables users to filter ads dynamically without additional HTTP requests.

Technical Details:

    APIs Used:
    
      WikiAds API: To fetch categories, subcategories, and ads.
      
      Login Service (LS): For user authentication.
      
      Add to Favorites Service (AFS): For adding ads to favorites.
      
      Favorites Retrieval Service (FRS): For retrieving a user's favorite ads.
      
    Tools and Libraries:
    
      Client-Side: HTML, CSS, JavaScript, Handlebars for dynamic HTML content, Fetch API for making HTTP requests.
      
      Server-Side: Node.js, Express framework for building the web services, uuid library for generating unique session IDs.
    
    Assumptions:
    
      Separate lists of favorite ads are maintained for each user.
      
      Favorite lists are not persistent and are lost upon server restart unless a MongoDB database is used (Bonus 2).
      
      The server initializes with a set of predefined users for demonstration purposes.

Execution Instructions:

    Client-Side:
    
      Open index.html to start navigating through categories and subcategories.
      
      Use category.html and subcategory.html for viewing ads.
      
      Log in via the form on category.html to add ads to favorites.
    
    Server-Side:
    
      Run the Node.js server to handle authentication and favorite management.

Bonus Features:

    Bonus 1: Filtering ads by subcategories.


Files Included:

    HTML Files: index.html, category.html, subcategory.html, favorite-ads.html
    
    JavaScript Files: Scripts for handling API calls, user interactions, and dynamic content generation.
    
    CSS Files: For styling the web pages.
    
    Server-Side Code: Node.js and Express-based server handling user authentication and favorite ads management.
