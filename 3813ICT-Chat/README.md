# 3813ICTChat

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


# Data Structures

## Users

- `id`: String - Unique identifier for each user.
- `username`: String - The username for login.
- `password`: String - The password for login.
- `email`: String - Email associated with the user.
- `role`: String - Specifies if the user is a 'Super Admin', 'Group Admin', or 'User'.
- `groups`: Array of Strings - IDs of groups that the user belongs to.

## Groups

- `id`: String - Unique identifier for each group.
- `name`: String - The name of the group.
- `channels`: Array of Channel objects - Contains the channels within the group.
- `admins`: Array of Strings - IDs of users who are administrators of the group.
- `members`: Array of Strings - IDs of users who are members of the group.
- `requests`: Array of Strings - IDs of users who have requested to join the group.

## Channels

- `name`: String - Name of the individual channel within a group.
- `messages`: Array - Contains the messages sent within the channel.