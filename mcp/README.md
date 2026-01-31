# Virtual Studio Art Display MCP Server

A Model Context Protocol (MCP) server for preparing stunning art pieces for spatial display on Rokid Station 2 and other WebXR devices.

## Overview

This MCP server provides AI assistants with tools to help prepare and configure art pieces for immersive spatial display in the Virtual Studio WebXR application. It's specifically optimized for the Rokid Station 2 spatial computer.

## Features

- **Art Piece Preparation**: Configure art images with optimal framing, lighting, and positioning
- **Procedural Frame Generation**: Create custom frames in various styles (modern, classic, minimalist, ornate, floating)
- **Gallery Layout Creation**: Arrange multiple art pieces in immersive 3D environments
- **Spatial Optimization**: Device-specific optimization for Rokid Station 2, Meta Quest, mobile, and desktop
- **Vibe Pairing**: Intelligent audio and lighting recommendations based on artwork characteristics

## Installation

```bash
cd mcp
npm install
npm run build
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "virtual-studio-art": {
      "command": "node",
      "args": ["/path/to/virtual-studio/mcp/dist/index.js"]
    }
  }
}
```

### With Other MCP Clients

The server uses stdio transport. Run with:

```bash
node dist/index.js
```

## Available Tools

### `prepare_art_piece`
Prepare an art piece for stunning spatial display. Configures optimal framing, lighting, and positioning.

**Parameters:**
- `name` (required): Name of the art piece
- `imageUri` (required): URL to the art image
- `description`: Description of the art piece
- `style`: Frame style preference (modern, classic, minimalist, ornate)
- `vibe`: Mood category (calm, upbeat, ambient)
- `width`: Width in meters
- `height`: Height in meters

### `configure_frame`
Configure a custom procedural frame for an art piece.

**Parameters:**
- `artName` (required): Name of the art piece to frame
- `frameStyle` (required): Style of the frame (modern, classic, minimalist, ornate, floating)
- `frameColor`: Frame color in hex format
- `frameWidth`: Frame border width in cm
- `matteEnabled`: Whether to add a matte border
- `matteColor`: Matte color if enabled

### `create_gallery_layout`
Create an immersive gallery layout for displaying multiple art pieces.

**Parameters:**
- `name` (required): Name of the gallery layout
- `roomTemplate` (required): Room template (living-room, bedroom, studio, custom)
- `artPieceIds` (required): Array of art piece IDs to include
- `arrangement`: How to arrange the art (linear, grid, circular, featured)
- `lightingPreset`: Lighting mood (gallery, cozy, dramatic, natural)

### `optimize_for_spatial`
Optimize an art image for spatial display on specific devices.

**Parameters:**
- `imageUri` (required): URL to the image
- `targetDevice` (required): Target device (rokid-station-2, meta-quest, mobile, desktop)
- `qualityPreset`: Quality vs performance (performance, balanced, quality)

### `get_display_config`
Generate a complete display configuration ready for use in Virtual Studio.

**Parameters:**
- `artPieceId` (required): ID of the prepared art piece
- `includeCode`: Include TypeScript code snippet for integration

### `list_art_pieces`
List all prepared art pieces in the current session.

### `suggest_vibe_pairing`
Suggest optimal audio vibe and lighting pairings for an art piece.

**Parameters:**
- `artDescription` (required): Description of the art piece
- `dominantColors`: Array of dominant colors in hex format

## Resources

The server provides access to configuration resources:

- `virtual-studio://config/rokid-station-2` - Optimal settings for Rokid Station 2
- `virtual-studio://config/frame-styles` - Available frame styles and colors
- `virtual-studio://config/room-templates` - VR room templates for gallery layouts

## Prompts

### `create_art_gallery`
Guided workflow for creating a complete art gallery display.

### `optimize_for_rokid`
Get recommendations for optimizing art display on Rokid Station 2.

## Example Workflow

```
1. Use prepare_art_piece to add your artwork
2. Use suggest_vibe_pairing to get lighting/audio recommendations
3. Use configure_frame to customize the frame style
4. Use optimize_for_spatial with targetDevice: "rokid-station-2"
5. Use create_gallery_layout to arrange multiple pieces
6. Use get_display_config with includeCode: true to export
```

## Rokid Station 2 Optimization

The MCP is specifically optimized for Rokid Station 2:

- **Texture Size**: Maximum 1024x1024 for optimal performance
- **Input**: D-Pad navigation support (Rokid remote)
- **Display**: AR passthrough mode for real-world overlay
- **Frame Rate**: Targets 60 FPS with adaptive quality
- **Audio**: Vibe-based ambient audio that matches artwork mood

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## License

MIT License - See [LICENSE](../LICENSE) for details.
