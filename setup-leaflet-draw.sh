#!/bin/bash

# Install leaflet and leaflet-draw
npm install leaflet leaflet-draw

# Install leaflet type definitions
npm install --save-dev @types/leaflet

# Create a simple type definition file for leaflet-draw
echo 'declare module "leaflet-draw";' > leaflet-draw.d.ts

echo "Setup complete! You may need to restart your TypeScript server."
