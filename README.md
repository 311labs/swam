# SWAM - Simple Web App for Mobile

Simple Web App for Mobile, is an extremely light weight mobile web app framework built on jquery, bootstrap, and mustache, with influence from backbone.

It has very basic routing and is a very basic Model View Controller based framework.

## WHY

I have been using this for years as a simple and easy way to rapidly prototype mobile apps.  These apps most often ended up in production and thus seem to scale well.   I am lazy when it comes to the UI and like to write as little as possible.

## Quick Start

 1. Download this project as a skeleton
 2. run the cli tool swam.py -w -s (by default this will serve your app on http://localhost:8080
 3. started editing and adding your own apps, pages, and views.

## Overview

The framework is built around the following core classes:
 * SWAM.View - this is a view js + html template
 * SWAM.App - this is the application view
 * SWAM.Page - this is a view that is considered the core content
 * SWAM.Dialog - this is a dialog view

## TODO

 * decrypt JWT and check if expired
 