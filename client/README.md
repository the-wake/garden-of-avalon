# Garden of Avalon

Garden of Avalon is a robust React-based currency calculator for Fate/Grand Order.

## Installation

Garden of Avalon can be pulled from [Github](https://github.com/the-wake/garden-of-avalon) and run on localhost3001, but I recommend using the web app at [garden-of-avalon.net](https://www.garden-of-avalon.net/).

## Usage

Users can save a list of upcoming rolls, automatically calculating currency based on starting parameters, weekly/monthly gains, etc. Data is stored in local storage and re-populated when the app is reloaded.

Garden of Avalon was built in VS Code using npm, create-react-app, Chakra UI, and custom styling, hosted at a private SSL-secured VPS. 

## Future Updates

Garden of Avalon has two major features to be implemented:

* An event calculator. Currently the app doesn't have a way of parsing event rewards, so they need to be added to a roll manually via the Event SQ / Event Tickets fields.
* A full-fledged node-express backend with a database and user account creation/saving.

## Contact

Made by Ben Martin.

* Github: https://github.com/the-wake
* Email: bmartin2009@gmail.com
* Bug Reports: https://github.com/the-wake/garden-of-avalon/issues
