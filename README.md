# Real Estate Platform with GIS Features

## Installation

1. Install dependencies:

\`\`\`bash
npm install
\`\`\`

2. Install the type definitions for leaflet:

\`\`\`bash
npm install --save-dev @types/leaflet
\`\`\`

3. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

## Leaflet Draw Integration

The platform uses Leaflet Draw for map drawing capabilities. Since there are no official type definitions for leaflet-draw, we've included custom type definitions in the `types/leaflet-draw.d.ts` file.

If you encounter any TypeScript errors related to leaflet-draw, you can:

1. Update the type definitions in `types/leaflet-draw.d.ts`
2. Add `// @ts-ignore` comments where necessary
3. Or install community-maintained type definitions if they become available:

\`\`\`bash
npm install --save-dev @types/leaflet-draw
\`\`\`

## Features

- Advanced property search with filters
- Map-based property search with drawing tools
- 360° virtual tours
- Neighborhood insights
- Mortgage calculator
- Property valuation tool
- Property comparison
