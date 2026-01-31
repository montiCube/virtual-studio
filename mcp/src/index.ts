#!/usr/bin/env node
/**
 * Virtual Studio Art Display MCP Server
 * 
 * A Model Context Protocol (MCP) server for preparing stunning art pieces
 * for spatial display on Rokid Station 2 and other WebXR devices.
 * 
 * This MCP provides tools for:
 * - Preparing art images for optimal spatial display
 * - Generating procedural frame configurations
 * - Creating gallery layouts for immersive viewing
 * - Optimizing art for AR/VR environments
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Art piece types matching the main application
type VibeCategory = 'calm' | 'upbeat' | 'ambient';

interface ArtPieceConfig {
  id: string;
  name: string;
  description: string;
  imageUri: string;
  frameColor: string;
  dimensions: { width: number; height: number };
  vibe: VibeCategory;
  price: number;
  displayPosition?: { x: number; y: number; z: number };
  lighting?: {
    intensity: number;
    color: string;
    spotlightAngle: number;
  };
  spatialEffects?: {
    enableReflection: boolean;
    ambientOcclusion: boolean;
    shadowQuality: 'low' | 'medium' | 'high';
  };
}

interface GalleryLayout {
  id: string;
  name: string;
  description: string;
  artPieces: ArtPieceConfig[];
  roomTemplate: 'living-room' | 'bedroom' | 'studio' | 'custom';
  lightingPreset: 'gallery' | 'cozy' | 'dramatic' | 'natural';
}

// Validation schemas
const ArtPieceInputSchema = z.object({
  name: z.string().min(1).describe('Name of the art piece'),
  description: z.string().optional().describe('Description of the art piece'),
  imageUri: z.string().url().describe('URL to the art image'),
  style: z.enum(['modern', 'classic', 'minimalist', 'ornate']).optional().describe('Frame style preference'),
  vibe: z.enum(['calm', 'upbeat', 'ambient']).optional().describe('Mood/vibe category'),
  width: z.number().positive().optional().describe('Width in meters (default: auto-calculated)'),
  height: z.number().positive().optional().describe('Height in meters (default: auto-calculated)'),
});

const FrameConfigSchema = z.object({
  artName: z.string().describe('Name of the art piece to frame'),
  frameStyle: z.enum(['modern', 'classic', 'minimalist', 'ornate', 'floating']).describe('Style of the frame'),
  frameColor: z.string().optional().describe('Frame color in hex format (e.g., #5c4033)'),
  frameWidth: z.number().positive().optional().describe('Frame border width in cm'),
  matteEnabled: z.boolean().optional().describe('Whether to add a matte border'),
  matteColor: z.string().optional().describe('Matte color if enabled'),
});

const GalleryLayoutSchema = z.object({
  name: z.string().describe('Name of the gallery layout'),
  roomTemplate: z.enum(['living-room', 'bedroom', 'studio', 'custom']).describe('Room template to use'),
  artPieceIds: z.array(z.string()).describe('IDs of art pieces to include'),
  arrangement: z.enum(['linear', 'grid', 'circular', 'featured']).optional().describe('How to arrange the art'),
  lightingPreset: z.enum(['gallery', 'cozy', 'dramatic', 'natural']).optional().describe('Lighting mood'),
});

const SpatialOptimizationSchema = z.object({
  imageUri: z.string().url().describe('URL to the image to optimize'),
  targetDevice: z.enum(['rokid-station-2', 'meta-quest', 'mobile', 'desktop']).describe('Target device'),
  qualityPreset: z.enum(['performance', 'balanced', 'quality']).optional().describe('Quality vs performance trade-off'),
});

// Frame color palettes by style
const FRAME_PALETTES = {
  modern: ['#2c2c2c', '#1a1a1a', '#404040', '#ffffff', '#e0e0e0'],
  classic: ['#5c4033', '#8B4513', '#654321', '#DAA520', '#B8860B'],
  minimalist: ['#ffffff', '#f5f5f5', '#000000', '#cccccc', '#e8e8e8'],
  ornate: ['#DAA520', '#FFD700', '#B8860B', '#8B4513', '#654321'],
  floating: ['transparent', '#ffffff10', '#00000010'],
};

// Vibe-based lighting configurations
const VIBE_LIGHTING = {
  calm: { intensity: 0.8, color: '#fff5e6', spotlightAngle: 45 },
  upbeat: { intensity: 1.2, color: '#ffffff', spotlightAngle: 30 },
  ambient: { intensity: 0.6, color: '#e6f0ff', spotlightAngle: 60 },
};

// Storage for created art pieces and layouts
const artPieceStorage: Map<string, ArtPieceConfig> = new Map();
const galleryLayoutStorage: Map<string, GalleryLayout> = new Map();

// Helper functions
function generateId(): string {
  return `art-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function selectFrameColor(style: string, vibe: VibeCategory): string {
  const palette = FRAME_PALETTES[style as keyof typeof FRAME_PALETTES] || FRAME_PALETTES.modern;
  // Select color based on vibe
  switch (vibe) {
    case 'calm':
      return palette[0]; // Darker, more subdued
    case 'upbeat':
      return palette[palette.length - 1]; // Lighter, more vibrant
    case 'ambient':
      return palette[Math.floor(palette.length / 2)]; // Middle ground
    default:
      return palette[0];
  }
}

function calculateDimensions(
  aspectRatio?: number,
  preferredWidth?: number,
  preferredHeight?: number
): { width: number; height: number } {
  // Default to a standard art size if not specified
  const defaultWidth = 1.0; // 1 meter
  const defaultHeight = 0.75; // 75cm (4:3 ratio)
  
  if (preferredWidth && preferredHeight) {
    return { width: preferredWidth, height: preferredHeight };
  }
  
  if (preferredWidth) {
    const ratio = aspectRatio || 4/3;
    return { width: preferredWidth, height: preferredWidth / ratio };
  }
  
  if (preferredHeight) {
    const ratio = aspectRatio || 4/3;
    return { width: preferredHeight * ratio, height: preferredHeight };
  }
  
  return { width: defaultWidth, height: defaultHeight };
}

function generateSpatialPosition(index: number, total: number, arrangement: string): { x: number; y: number; z: number } {
  const baseY = 1.5; // Standard art height (eye level)
  const spacing = 2.0; // 2 meters between pieces
  
  switch (arrangement) {
    case 'linear':
      return { x: (index - (total - 1) / 2) * spacing, y: baseY, z: -2 };
    case 'circular':
      const angle = (index / total) * Math.PI * 2;
      const radius = 4;
      return { 
        x: Math.sin(angle) * radius, 
        y: baseY, 
        z: -Math.cos(angle) * radius 
      };
    case 'grid':
      const cols = Math.ceil(Math.sqrt(total));
      const row = Math.floor(index / cols);
      const col = index % cols;
      return { 
        x: (col - (cols - 1) / 2) * spacing, 
        y: baseY - row * 1.5, 
        z: -2 
      };
    case 'featured':
      if (index === 0) {
        return { x: 0, y: baseY, z: -2.5 }; // Center featured piece
      }
      return { 
        x: (index % 2 === 0 ? 1 : -1) * (Math.ceil(index / 2) * spacing * 0.8), 
        y: baseY, 
        z: -2 
      };
    default:
      return { x: index * spacing - spacing, y: baseY, z: -2 };
  }
}

// Create the MCP server
const server = new Server(
  {
    name: 'virtual-studio-art-display',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'prepare_art_piece',
        description: 'Prepare an art piece for stunning spatial display. Configures optimal framing, lighting, and positioning for immersive viewing on Rokid Station 2 and other WebXR devices.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name of the art piece' },
            description: { type: 'string', description: 'Description of the art piece' },
            imageUri: { type: 'string', description: 'URL to the art image' },
            style: { 
              type: 'string', 
              enum: ['modern', 'classic', 'minimalist', 'ornate'],
              description: 'Frame style preference'
            },
            vibe: { 
              type: 'string', 
              enum: ['calm', 'upbeat', 'ambient'],
              description: 'Mood/vibe category for audio and lighting matching'
            },
            width: { type: 'number', description: 'Width in meters' },
            height: { type: 'number', description: 'Height in meters' },
          },
          required: ['name', 'imageUri'],
        },
      },
      {
        name: 'configure_frame',
        description: 'Configure a custom procedural frame for an art piece. Frames are generated procedurally for optimal WebXR performance.',
        inputSchema: {
          type: 'object',
          properties: {
            artName: { type: 'string', description: 'Name of the art piece to frame' },
            frameStyle: { 
              type: 'string', 
              enum: ['modern', 'classic', 'minimalist', 'ornate', 'floating'],
              description: 'Style of the frame'
            },
            frameColor: { type: 'string', description: 'Frame color in hex format (e.g., #5c4033)' },
            frameWidth: { type: 'number', description: 'Frame border width in cm' },
            matteEnabled: { type: 'boolean', description: 'Whether to add a matte border' },
            matteColor: { type: 'string', description: 'Matte color if enabled' },
          },
          required: ['artName', 'frameStyle'],
        },
      },
      {
        name: 'create_gallery_layout',
        description: 'Create an immersive gallery layout for displaying multiple art pieces in a spatial environment.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name of the gallery layout' },
            roomTemplate: { 
              type: 'string', 
              enum: ['living-room', 'bedroom', 'studio', 'custom'],
              description: 'Room template to use'
            },
            artPieceIds: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'IDs of art pieces to include'
            },
            arrangement: { 
              type: 'string', 
              enum: ['linear', 'grid', 'circular', 'featured'],
              description: 'How to arrange the art pieces'
            },
            lightingPreset: { 
              type: 'string', 
              enum: ['gallery', 'cozy', 'dramatic', 'natural'],
              description: 'Lighting mood for the gallery'
            },
          },
          required: ['name', 'roomTemplate', 'artPieceIds'],
        },
      },
      {
        name: 'optimize_for_spatial',
        description: 'Optimize an art image for spatial display on specific devices. Returns recommended texture settings and quality configurations.',
        inputSchema: {
          type: 'object',
          properties: {
            imageUri: { type: 'string', description: 'URL to the image to optimize' },
            targetDevice: { 
              type: 'string', 
              enum: ['rokid-station-2', 'meta-quest', 'mobile', 'desktop'],
              description: 'Target device for optimization'
            },
            qualityPreset: { 
              type: 'string', 
              enum: ['performance', 'balanced', 'quality'],
              description: 'Quality vs performance trade-off'
            },
          },
          required: ['imageUri', 'targetDevice'],
        },
      },
      {
        name: 'get_display_config',
        description: 'Generate a complete display configuration for an art piece, ready for use in the Virtual Studio spatial app.',
        inputSchema: {
          type: 'object',
          properties: {
            artPieceId: { type: 'string', description: 'ID of the prepared art piece' },
            includeCode: { type: 'boolean', description: 'Include TypeScript code snippet for integration' },
          },
          required: ['artPieceId'],
        },
      },
      {
        name: 'list_art_pieces',
        description: 'List all prepared art pieces in the current session.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'suggest_vibe_pairing',
        description: 'Suggest optimal audio vibe and lighting pairings for an art piece based on its characteristics.',
        inputSchema: {
          type: 'object',
          properties: {
            artDescription: { type: 'string', description: 'Description of the art piece for analysis' },
            dominantColors: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Dominant colors in the artwork (hex format)'
            },
          },
          required: ['artDescription'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'prepare_art_piece': {
        const input = ArtPieceInputSchema.parse(args);
        const id = generateId();
        const vibe = input.vibe || 'calm';
        const style = input.style || 'modern';
        
        const artPiece: ArtPieceConfig = {
          id,
          name: input.name,
          description: input.description || `A stunning art piece: ${input.name}`,
          imageUri: input.imageUri,
          frameColor: selectFrameColor(style, vibe),
          dimensions: calculateDimensions(undefined, input.width, input.height),
          vibe,
          price: 0, // Price to be set separately
          displayPosition: { x: 0, y: 1.5, z: -2 },
          lighting: VIBE_LIGHTING[vibe],
          spatialEffects: {
            enableReflection: true,
            ambientOcclusion: true,
            shadowQuality: 'medium',
          },
        };
        
        artPieceStorage.set(id, artPiece);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Art piece "${input.name}" prepared for stunning spatial display!`,
                artPiece: {
                  id: artPiece.id,
                  name: artPiece.name,
                  dimensions: artPiece.dimensions,
                  frameColor: artPiece.frameColor,
                  vibe: artPiece.vibe,
                  lighting: artPiece.lighting,
                  spatialEffects: artPiece.spatialEffects,
                },
                nextSteps: [
                  'Use configure_frame to customize the frame style',
                  'Use create_gallery_layout to arrange multiple pieces',
                  'Use get_display_config to export for Virtual Studio',
                ],
              }, null, 2),
            },
          ],
        };
      }

      case 'configure_frame': {
        const input = FrameConfigSchema.parse(args);
        
        // Find the art piece by name
        let artPiece: ArtPieceConfig | undefined;
        for (const piece of artPieceStorage.values()) {
          if (piece.name.toLowerCase() === input.artName.toLowerCase()) {
            artPiece = piece;
            break;
          }
        }
        
        if (!artPiece) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: `Art piece "${input.artName}" not found. Use prepare_art_piece first.`,
                }, null, 2),
              },
            ],
          };
        }
        
        // Update frame configuration
        const frameColor = input.frameColor || selectFrameColor(input.frameStyle, artPiece.vibe);
        artPiece.frameColor = frameColor;
        
        const frameConfig = {
          style: input.frameStyle,
          color: frameColor,
          width: input.frameWidth || (input.frameStyle === 'minimalist' ? 1 : 3),
          matte: input.matteEnabled ? {
            enabled: true,
            color: input.matteColor || '#f5f5f5',
            width: 5, // cm
          } : { enabled: false },
        };
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Frame configured for "${artPiece.name}" with ${input.frameStyle} style`,
                artPieceId: artPiece.id,
                frameConfig,
                preview: `Your art will be displayed with a ${input.frameStyle} ${frameColor} frame${input.matteEnabled ? ' with matte border' : ''}.`,
              }, null, 2),
            },
          ],
        };
      }

      case 'create_gallery_layout': {
        const input = GalleryLayoutSchema.parse(args);
        const id = `gallery-${Date.now()}`;
        const arrangement = input.arrangement || 'linear';
        
        // Gather art pieces
        const artPieces: ArtPieceConfig[] = [];
        for (const artId of input.artPieceIds) {
          const piece = artPieceStorage.get(artId);
          if (piece) {
            artPieces.push(piece);
          }
        }
        
        if (artPieces.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: 'No valid art pieces found. Prepare art pieces first using prepare_art_piece.',
                  availableIds: Array.from(artPieceStorage.keys()),
                }, null, 2),
              },
            ],
          };
        }
        
        // Calculate positions for each piece
        artPieces.forEach((piece, index) => {
          piece.displayPosition = generateSpatialPosition(index, artPieces.length, arrangement);
        });
        
        const layout: GalleryLayout = {
          id,
          name: input.name,
          description: `${input.name} - ${artPieces.length} pieces in ${input.roomTemplate}`,
          artPieces,
          roomTemplate: input.roomTemplate,
          lightingPreset: input.lightingPreset || 'gallery',
        };
        
        galleryLayoutStorage.set(id, layout);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Gallery layout "${input.name}" created with ${artPieces.length} art pieces!`,
                layout: {
                  id: layout.id,
                  name: layout.name,
                  roomTemplate: layout.roomTemplate,
                  lightingPreset: layout.lightingPreset,
                  arrangement,
                  pieceCount: artPieces.length,
                  pieces: artPieces.map(p => ({
                    id: p.id,
                    name: p.name,
                    position: p.displayPosition,
                  })),
                },
                readyForDisplay: true,
              }, null, 2),
            },
          ],
        };
      }

      case 'optimize_for_spatial': {
        const input = SpatialOptimizationSchema.parse(args);
        const qualityPreset = input.qualityPreset || 'balanced';
        
        // Device-specific optimization settings
        const deviceSettings = {
          'rokid-station-2': {
            maxTextureSize: 1024,
            recommendedFormat: 'WEBP',
            compressionQuality: 0.85,
            anisotropy: 4,
            mipmaps: true,
            notes: 'Optimized for Rokid Station 2 Android-based spatial computer with D-Pad navigation',
          },
          'meta-quest': {
            maxTextureSize: 2048,
            recommendedFormat: 'WEBP',
            compressionQuality: 0.9,
            anisotropy: 8,
            mipmaps: true,
            notes: 'Optimized for Meta Quest with hand tracking support',
          },
          'mobile': {
            maxTextureSize: 1024,
            recommendedFormat: 'WEBP',
            compressionQuality: 0.8,
            anisotropy: 4,
            mipmaps: true,
            notes: 'Optimized for mobile WebXR with touch input',
          },
          'desktop': {
            maxTextureSize: 2048,
            recommendedFormat: 'PNG',
            compressionQuality: 1.0,
            anisotropy: 16,
            mipmaps: true,
            notes: 'High quality for desktop browsers',
          },
        };
        
        const qualityMultipliers = {
          performance: 0.5,
          balanced: 1.0,
          quality: 1.5,
        };
        
        const settings = deviceSettings[input.targetDevice];
        const multiplier = qualityMultipliers[qualityPreset];
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                imageUri: input.imageUri,
                targetDevice: input.targetDevice,
                qualityPreset,
                optimizationSettings: {
                  textureSize: Math.min(settings.maxTextureSize * multiplier, 2048),
                  format: settings.recommendedFormat,
                  compressionQuality: settings.compressionQuality,
                  anisotropy: settings.anisotropy,
                  mipmaps: settings.mipmaps,
                },
                deviceNotes: settings.notes,
                recommendations: [
                  `Use ${settings.recommendedFormat} format for best performance`,
                  `Texture size should not exceed ${settings.maxTextureSize}px`,
                  input.targetDevice === 'rokid-station-2' 
                    ? 'Ensure D-Pad navigation is enabled for Rokid remote control'
                    : 'Enable touch/hand tracking for interaction',
                ],
              }, null, 2),
            },
          ],
        };
      }

      case 'get_display_config': {
        const { artPieceId, includeCode } = args as { artPieceId: string; includeCode?: boolean };
        
        const artPiece = artPieceStorage.get(artPieceId);
        if (!artPiece) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: `Art piece with ID "${artPieceId}" not found.`,
                  availableIds: Array.from(artPieceStorage.keys()),
                }, null, 2),
              },
            ],
          };
        }
        
        const config = {
          id: artPiece.id,
          name: artPiece.name,
          type: 'art' as const,
          vibe: artPiece.vibe,
          imageUri: artPiece.imageUri,
          frameColor: artPiece.frameColor,
          dimensions: artPiece.dimensions,
          price: artPiece.price,
          description: artPiece.description,
        };
        
        let codeSnippet = '';
        if (includeCode) {
          codeSnippet = `
// Add to stores/MockStore.ts - MOCK_ART_PRODUCTS array
const newArtPiece: ArtProduct = {
  id: '${config.id}',
  name: '${config.name}',
  type: 'art',
  vibe: '${config.vibe}',
  imageUri: '${config.imageUri}',
  frameColor: '${config.frameColor}',
  dimensions: { width: ${config.dimensions.width}, height: ${config.dimensions.height} },
  price: ${config.price},
  description: '${config.description}',
};
`;
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Display configuration ready for "${artPiece.name}"`,
                config,
                ...(includeCode ? { codeSnippet } : {}),
                integrationSteps: [
                  '1. Copy the configuration to lib/constants.ts MOCK_ASSETS.images',
                  '2. Add the art product to stores/MockStore.ts',
                  '3. The art will appear in the gallery carousel',
                  '4. Use XR Preview button to view in AR on Rokid Station 2',
                ],
              }, null, 2),
            },
          ],
        };
      }

      case 'list_art_pieces': {
        const pieces = Array.from(artPieceStorage.values()).map(p => ({
          id: p.id,
          name: p.name,
          vibe: p.vibe,
          dimensions: p.dimensions,
          frameColor: p.frameColor,
        }));
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                count: pieces.length,
                artPieces: pieces,
                message: pieces.length === 0 
                  ? 'No art pieces prepared yet. Use prepare_art_piece to get started!'
                  : `Found ${pieces.length} prepared art piece(s)`,
              }, null, 2),
            },
          ],
        };
      }

      case 'suggest_vibe_pairing': {
        const { artDescription, dominantColors } = args as { 
          artDescription: string; 
          dominantColors?: string[] 
        };
        
        // Simple heuristic-based vibe suggestion
        const lowerDesc = artDescription.toLowerCase();
        
        let suggestedVibe: VibeCategory = 'calm';
        const vibeReasons: string[] = [];
        
        // Check for calm indicators
        const calmWords = ['serene', 'peaceful', 'calm', 'quiet', 'soft', 'gentle', 'nature', 'landscape', 'sky', 'water', 'blue', 'green'];
        const upbeatWords = ['vibrant', 'bold', 'dynamic', 'energy', 'bright', 'colorful', 'urban', 'abstract', 'modern', 'red', 'orange', 'yellow'];
        const ambientWords = ['subtle', 'ambient', 'atmospheric', 'muted', 'neutral', 'minimalist', 'contemporary', 'gray', 'earth', 'natural'];
        
        const calmScore = calmWords.filter(w => lowerDesc.includes(w)).length;
        const upbeatScore = upbeatWords.filter(w => lowerDesc.includes(w)).length;
        const ambientScore = ambientWords.filter(w => lowerDesc.includes(w)).length;
        
        if (upbeatScore > calmScore && upbeatScore > ambientScore) {
          suggestedVibe = 'upbeat';
          vibeReasons.push('Description suggests energetic, dynamic content');
        } else if (ambientScore > calmScore) {
          suggestedVibe = 'ambient';
          vibeReasons.push('Description suggests subtle, atmospheric content');
        } else {
          suggestedVibe = 'calm';
          vibeReasons.push('Description suggests peaceful, serene content');
        }
        
        // Color analysis
        if (dominantColors && dominantColors.length > 0) {
          // Simple color temperature check
          const warmColors = dominantColors.filter(c => {
            const r = parseInt(c.slice(1, 3), 16);
            const b = parseInt(c.slice(5, 7), 16);
            return r > b;
          });
          
          if (warmColors.length > dominantColors.length / 2) {
            vibeReasons.push('Warm color palette detected');
            if (suggestedVibe === 'calm') {
              vibeReasons.push('Consider "upbeat" vibe for warm tones');
            }
          } else {
            vibeReasons.push('Cool color palette detected');
          }
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                suggestedVibe,
                lighting: VIBE_LIGHTING[suggestedVibe],
                audioTrack: {
                  calm: 'Calm Ambience - Soft, meditative background',
                  upbeat: 'Upbeat Vibes - Energetic, engaging rhythm',
                  ambient: 'Ambient Sounds - Subtle, atmospheric layers',
                }[suggestedVibe],
                reasoning: vibeReasons,
                alternatives: Object.keys(VIBE_LIGHTING).filter(v => v !== suggestedVibe),
                tip: 'The vibe affects both the background audio and spotlight lighting when viewing in the gallery.',
              }, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: `Unknown tool: ${name}`,
                availableTools: [
                  'prepare_art_piece',
                  'configure_frame',
                  'create_gallery_layout',
                  'optimize_for_spatial',
                  'get_display_config',
                  'list_art_pieces',
                  'suggest_vibe_pairing',
                ],
              }, null, 2),
            },
          ],
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'Tool execution failed',
            details: error instanceof Error ? error.message : String(error),
          }, null, 2),
        },
      ],
    };
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'virtual-studio://config/rokid-station-2',
        name: 'Rokid Station 2 Configuration',
        description: 'Optimal display settings for Rokid Station 2 spatial computer',
        mimeType: 'application/json',
      },
      {
        uri: 'virtual-studio://config/frame-styles',
        name: 'Frame Styles',
        description: 'Available procedural frame styles for art display',
        mimeType: 'application/json',
      },
      {
        uri: 'virtual-studio://config/room-templates',
        name: 'VR Room Templates',
        description: 'Available virtual room templates for gallery layouts',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'virtual-studio://config/rokid-station-2':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              device: 'Rokid Station 2',
              category: 'ar-glasses',
              capabilities: {
                hasPassthrough: true,
                hasHandTracking: false,
                hasCamera: false,
                supportsRoomScan: false,
                recommendedMode: 'ar',
              },
              inputMethod: 'D-Pad (Rokid Remote)',
              displaySettings: {
                maxTextureSize: 1024,
                targetFrameRate: 60,
                pixelRatio: 1.5,
                shadowMapSize: 1024,
                maxAnisotropy: 4,
              },
              navigation: {
                next: ['ArrowRight', 'KeyD', 'Gamepad D-Pad Right'],
                previous: ['ArrowLeft', 'KeyA', 'Gamepad D-Pad Left'],
                select: ['Enter', 'Space', 'Gamepad A Button'],
              },
            }, null, 2),
          },
        ],
      };

    case 'virtual-studio://config/frame-styles':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              styles: {
                modern: {
                  description: 'Clean, contemporary frames with sharp edges',
                  colors: FRAME_PALETTES.modern,
                  defaultWidth: 2,
                },
                classic: {
                  description: 'Traditional wooden frames with warm tones',
                  colors: FRAME_PALETTES.classic,
                  defaultWidth: 4,
                },
                minimalist: {
                  description: 'Ultra-thin frames that let the art speak',
                  colors: FRAME_PALETTES.minimalist,
                  defaultWidth: 1,
                },
                ornate: {
                  description: 'Decorative frames with gold accents',
                  colors: FRAME_PALETTES.ornate,
                  defaultWidth: 5,
                },
                floating: {
                  description: 'Frameless display with subtle shadow',
                  colors: FRAME_PALETTES.floating,
                  defaultWidth: 0,
                },
              },
            }, null, 2),
          },
        ],
      };

    case 'virtual-studio://config/room-templates':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              templates: {
                'living-room': {
                  name: 'Living Room',
                  description: 'A cozy living room space (12\' x 14\')',
                  dimensions: { width: 3.66, depth: 4.27, height: 2.74 },
                },
                bedroom: {
                  name: 'Bedroom',
                  description: 'A comfortable bedroom (10\' x 12\')',
                  dimensions: { width: 3.05, depth: 3.66, height: 2.74 },
                },
                studio: {
                  name: 'Studio Apartment',
                  description: 'An open studio space (20\' x 25\')',
                  dimensions: { width: 6.1, depth: 7.62, height: 2.74 },
                },
                custom: {
                  name: 'Custom Room',
                  description: 'Upload your own room scan or customize dimensions',
                  dimensions: { width: 4.0, depth: 4.0, height: 2.74 },
                },
              },
            }, null, 2),
          },
        ],
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'create_art_gallery',
        description: 'Guide through creating a stunning art gallery for spatial display',
        arguments: [
          {
            name: 'artworkCount',
            description: 'Number of art pieces to display (1-10)',
            required: false,
          },
          {
            name: 'style',
            description: 'Overall gallery style (modern, classic, eclectic)',
            required: false,
          },
        ],
      },
      {
        name: 'optimize_for_rokid',
        description: 'Get recommendations for optimizing art display on Rokid Station 2',
        arguments: [
          {
            name: 'artType',
            description: 'Type of art (photography, painting, digital, mixed)',
            required: false,
          },
        ],
      },
    ],
  };
});

// Handle prompt requests
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: promptArgs } = request.params;

  switch (name) {
    case 'create_art_gallery':
      const count = promptArgs?.artworkCount || '3';
      const style = promptArgs?.style || 'modern';
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I want to create a stunning ${style} art gallery with ${count} pieces for display on my Rokid Station 2. 

Please help me:
1. Prepare each art piece with optimal settings using prepare_art_piece
2. Configure beautiful frames using configure_frame  
3. Create an immersive gallery layout using create_gallery_layout
4. Optimize all images for the Rokid Station 2 using optimize_for_spatial

For each piece, suggest appropriate vibes (calm/upbeat/ambient) and frame styles that complement the artwork.

Let's create something visually stunning that takes full advantage of spatial computing!`,
            },
          },
        ],
      };

    case 'optimize_for_rokid':
      const artType = promptArgs?.artType || 'mixed';
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I'm preparing ${artType} art for display on my Rokid Station 2 spatial computer.

Please provide:
1. Optimal texture sizes and formats for the device
2. Frame style recommendations for AR passthrough viewing
3. Lighting configurations that work well with transparent backgrounds
4. Navigation tips for D-Pad remote control
5. Any performance considerations I should be aware of

Use the optimize_for_spatial tool with targetDevice: "rokid-station-2" to get specific recommendations.`,
            },
          },
        ],
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Virtual Studio Art Display MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
