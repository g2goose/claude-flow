/**
 * Verification Security Module - Entry Point
 * 
 * This module provides a comprehensive security enforcement system
 * for agent truth verification with enterprise-grade security features.
 */

// Main security system
export { 
  SecurityEnforcementSystem as default,
  SecurityEnforcementSystem 
} from './security.js';

// Individual security components
export {
  AgentAuthenticationSystem,
  AdvancedRateLimiter,
  AuditTrailSystem,
  ByzantineFaultToleranceSystem,
  ThresholdSignatureSystem,
  ZeroKnowledgeProofSystem,
  CryptographicCore
} from './security.js';

// Verification hooks and CLI integration
export { 
  verificationHookManager
} from './hooks.js';

export { 
  VerificationCLICommands,
  createVerificationCommand,
  executeVerificationFromCLI 
} from './cli-integration.js';

// Types and interfaces
export * from './types.js';