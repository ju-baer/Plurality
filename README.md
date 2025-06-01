# PLURALITY - The Intersoul Infrastructure

An immersive, cosmic-feeling, non-linear interface where thoughts evolve, merge, orbit, or die. PLURALITY is not a website — it is a **living, idea-reactive space**. Visitors don't navigate. They resonate.

## Overview

This project implements the PLURALITY concept as described in the art-direction manifesto. It creates an immersive, interactive experience with the following key features:

- **Cosmic Background**: Dynamic stellar iridescence with shifting colors and patterns
- **Cognitons**: Floating idea-forms that react to cursor proximity with emotional ripples
- **Echo Ribbons**: Trails between related concepts that stretch, shimmer, and connect
- **Concept Nebulae**: Thought-clusters slowly forming constellations of emerging meaning
- **Resonance Fields**: Touch-based metaphors that pulsate with user intention
- **IdeoPortals**: Entry points into deeper layers of non-verbal interaction
- **Ambient Soundscape**: Generative audio that responds to interactions

## Technology Stack

- **React**: Frontend framework
- **TypeScript**: Type-safe JavaScript
- **Three.js**: 3D rendering
- **@react-three/fiber & @react-three/drei**: React bindings for Three.js
- **GSAP**: Animations
- **Tone.js**: Audio synthesis and effects
- **Tailwind CSS**: Styling

## Installation

1. Ensure you have Node.js and pnpm installed
2. Clone this repository
3. Navigate to the project directory
4. Install dependencies:
   ```
   pnpm install
   ```
5. Start the development server:
   ```
   pnpm run dev
   ```
6. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## Interaction Guide

- **Mouse Movement**: Navigate the cosmic space
- **Click on Cognitons**: Trigger sound and visual effects
- **Click on IdeoPortals**: Generate new Cognitons and connections
- **First Click Anywhere**: Initialize the ambient soundscape

## Design Principles

As specified in the manifesto, PLURALITY follows these core design principles:

1. **No Boxes. No Grids. No UI.**
   - Everything is organic, flowing, and non-Euclidean
   - Avoids rectangles in favor of idea-orbitals, cognition spirals, and liquid morphing clusters

2. **Idea-First Navigation**
   - Users interact with conceptual fields that unfold thought-holograms
   - Navigation is based on resonance rather than traditional clicking

3. **Sensory Layering**
   - Layers sound, motion, text, and light like dream-logic
   - Each idea emits a unique tone, with harmonic collisions creating emergent music

4. **Temporal Fluidity**
   - The interface evolves in real time, like living thoughts
   - Elements subtly change and respond to time and interaction

## Color Palette

- **Stellar Iridescence**: Dynamic gradient backgrounds (purple–blue–teal–gold)
- **Obsidian Black**: Void spaces, negative room
- **Thoughtlight Silver**: Text, cognition trails
- **Emotion Coral**: Highlighted pulses, idea collisions
- **Ghostwhite Smoke**: Ethereal UI elements, memory trails

## Deployment

For production deployment:

1. Build the project:
   ```
   pnpm run build
   ```
2. The built files will be in the `dist` directory, ready to be deployed to any static hosting service
