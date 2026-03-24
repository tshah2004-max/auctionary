# Auctionary 🚗

A full-stack auction platform built as part of a university module in Full Stack Web Development at Manchester Metropolitan University. The frontend is themed around a car auction marketplace.

## Overview

Auctionary is a decoupled web application consisting of an independent Node.js/Express backend and a Vue.js frontend. The two services communicate via a RESTful API conforming to a predefined OpenAPI specification.

The backend was assessed against 128 automated test scripts — all 128 passing.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Frontend | Vue.js |
| Database | SQLite |
| API Spec | OpenAPI / Swagger |
| Testing | Automated test scripts |

## Features

- User registration and authentication
- Create, view, and manage auction listings
- Place and track bids in real time
- Search and filter auctions
- Car auction themed frontend UI

## Getting Started

### Backend
Navigate to /backend, run npm install, then node server.js

### Frontend
Navigate to /frontend, run npm install, then npm run dev

## API

The backend implements the Auctionary REST API as defined in the OpenAPI specification:
https://app.swaggerhub.com/apis/MMU-SE/Auctionary/1.0.0

## Academic Context

This project was completed as coursework for the Full Stack Web Development module (6G5Z0038) at Manchester Metropolitan University. The API specification and database structure were provided as part of the brief. All implementation code is my own.