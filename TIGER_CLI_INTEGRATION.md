# Tiger CLI Integration Guide

This document explains the enhanced Tiger CLI integration in the Agentic Orchestrator platform.

## Overview

The `TigerWrapper` service provides a comprehensive interface to Tiger Cloud CLI commands with intelligent fallback mechanisms, proper error handling, and production-ready features.

## Features

### 🚀 **Core Functionality**
- **Service Management**: List, create, delete, and manage Tiger Cloud services
- **Zero-Copy Forks**: Create instant database forks for safe experimentation
- **Connection Management**: Retrieve and manage database connection strings
- **Metrics & Monitoring**: Get real-time performance metrics
- **Backup Management**: Create and manage database backups
- **Region Support**: List and work with multiple Tiger Cloud regions

### 🛡️ **Production Features**
- **Intelligent Fallbacks**: Automatic fallback to mock data when CLI unavailable
- **Error Handling**: Comprehensive error messages with actionable guidance
- **Authentication**: Multiple authentication methods (API key, CLI login)
- **Timeout Management**: Configurable timeouts for long-running operations
- **Validation**: Service existence validation before operations
- **Status Monitoring**: Wait for services to reach ready state

## Configuration

### Environment Variables

```bash
# Required for production use
TIGER_API_KEY=your_tiger_api_key_here

# Optional configuration
TIGER_CLI_PATH=/custom/path/to/tiger        # Custom CLI path
TIGER_ENDPOINT=https://api.timescale.cloud  # Custom endpoint
TIGER_REGION=us-east-1                      # Default region
TIGER_TIMEOUT=30000                         # Timeout in milliseconds
```

### Tiger CLI Installation

1. **Download Tiger CLI**:
   ```bash
   # macOS
   brew install timescale/tap/tiger-cli
   
   # Linux/Windows
   # Download from https://github.com/timescale/timescaledb-cli
   ```

2. **Authenticate**:
   ```bash
   # Method 1: Interactive login
   tiger auth login
   
   # Method 2: API key environment variable
   export TIGER_API_KEY=your_api_key
   ```

3. **Verify Installation**:
   ```bash
   tiger --version
   tiger service list
   ```

## API Reference

### Initialization

```typescript
import { tigerWrapper } from './services/tigerWrapper.js';

// Initialize (happens automatically on import)
await tigerWrapper.initialize();
```

### Service Management

```typescript
// List all services
const services = await tigerWrapper.listServices();
console.log('Services:', services);

// Get service metrics
const metrics = await tigerWrapper.getServiceMetrics('service-id');
console.log('CPU Usage:', metrics.cpu_usage);

// Get connection string
const connectionString = await tigerWrapper.getServiceConnection('service-id');
console.log('Connection:', connectionString);

// Scale service
await tigerWrapper.scaleService('service-id', 'medium');

// Delete service
await tigerWrapper.deleteService('service-id');
```

### Fork Management

```typescript
// Create a fork
const fork = await tigerWrapper.createFork('parent-service-id', 'my-fork-name');
console.log('Fork created:', fork);

// Merge fork back to parent
await tigerWrapper.mergeFork(fork.id, 'parent-service-id');
```

### Backup Operations

```typescript
// Create backup
const backupId = await tigerWrapper.createBackup('service-id', 'backup-name');
console.log('Backup created:', backupId);
```

### Utility Functions

```typescript
// List available regions
const regions = await tigerWrapper.listRegions();
console.log('Available regions:', regions);
```

## Error Handling

The TigerWrapper provides detailed error messages:

```typescript
try {
  await tigerWrapper.createFork('invalid-service', 'test-fork');
} catch (error) {
  console.error('Error:', error.message);
  // Example: "Tiger resource not found. Please check the service ID or resource name."
}
```

### Common Error Messages

| Error | Description | Solution |
|-------|-------------|----------|
| `Tiger CLI not found` | CLI not installed | Install Tiger CLI and add to PATH |
| `Tiger CLI authentication failed` | Not authenticated | Run `tiger auth login` or set API key |
| `Tiger resource not found` | Invalid service ID | Verify service exists |
| `Network error connecting` | Connection issues | Check internet connection |
| `Tiger API rate limit exceeded` | Too many requests | Wait before retrying |

## Testing

### Run Integration Tests

```bash
# Test all Tiger CLI integration
cd server
node test-tiger-cli.mjs
```

### Test Specific Functionality

```bash
# Test in your application
import { tigerWrapper } from './services/tigerWrapper.js';

// Test service listing
const services = await tigerWrapper.listServices();
console.log('Found services:', services.length);
```

## Fallback Behavior

When Tiger CLI is unavailable, the wrapper automatically falls back to mock data:

- **Service Listing**: Returns sample services with realistic data
- **Fork Creation**: Creates mock fork objects with generated IDs
- **Metrics**: Returns randomized but realistic performance metrics
- **Connection Strings**: Generates mock connection strings
- **Operations**: Simulates operations with appropriate delays

This ensures your application continues to function during development or when Tiger CLI is unavailable.

## Best Practices

### 1. **Environment Setup**
```bash
# Development
export TIGER_API_KEY=dev_api_key

# Production  
export TIGER_API_KEY=prod_api_key
export TIGER_TIMEOUT=60000  # Longer timeout for production
```

### 2. **Error Handling**
```typescript
try {
  const fork = await tigerWrapper.createFork(serviceId, forkName);
  // Always wait for fork to be ready
  // (automatically handled by the wrapper)
} catch (error) {
  logger.error('Fork creation failed:', error.message);
  // Handle gracefully - maybe retry or use fallback
}
```

### 3. **Resource Cleanup**
```typescript
// Always clean up forks after use
try {
  const fork = await tigerWrapper.createFork(serviceId, 'temp-fork');
  
  // Do work with fork...
  
  // Clean up
  await tigerWrapper.deleteService(fork.id);
} catch (error) {
  logger.error('Fork lifecycle error:', error);
}
```

### 4. **Service Validation**
```typescript
// The wrapper automatically validates services exist before operations
// But you can also check explicitly
const services = await tigerWrapper.listServices();
const serviceExists = services.some(s => s.id === targetServiceId);

if (!serviceExists) {
  throw new Error(`Service ${targetServiceId} not found`);
}
```

## Integration with Agents

The enhanced Tiger CLI integration works seamlessly with your orchestration agents:

```typescript
// ETL Agent using Tiger forks
const fork = await tigerWrapper.createFork(sourceServiceId, 'etl-work');
// Process data in fork...
await tigerWrapper.mergeFork(fork.id, targetServiceId);

// DBA Agent using metrics
const metrics = await tigerWrapper.getServiceMetrics(serviceId);
if (metrics.cpu_usage > 80) {
  await tigerWrapper.scaleService(serviceId, 'large');
}

// Backup before major operations
const backupId = await tigerWrapper.createBackup(serviceId, 'pre-migration');
```

## Troubleshooting

### Tiger CLI Not Found
```bash
# Check if Tiger CLI is installed
which tiger
tiger --version

# If not found, install it
# See installation instructions above
```

### Authentication Issues
```bash
# Check current auth status
tiger auth status

# Re-authenticate
tiger auth login

# Or use API key
export TIGER_API_KEY=your_key_here
```

### Timeout Issues
```bash
# Increase timeout for slow operations
export TIGER_TIMEOUT=60000  # 60 seconds
```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
node your-app.js
```

## Support

For issues with:
- **Tiger CLI**: Visit [TimescaleDB CLI Repository](https://github.com/timescale/timescaledb-cli)
- **Tiger Cloud**: Check [Timescale Cloud Documentation](https://docs.timescale.com/cloud/)
- **Integration**: Check the test scripts and error messages for guidance