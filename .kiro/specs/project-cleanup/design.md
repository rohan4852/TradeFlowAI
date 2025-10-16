# Design Document

## Overview

The project cleanup feature will systematically remove unused files, directories, and dependencies from the AI Trading LLM project while preserving all essential functionality. Based on analysis of the current project structure, the cleanup will focus on removing references to training and data directories that are no longer needed since the project now uses the Gemini API instead of local model training.

## Architecture

The cleanup process will follow a multi-phase approach:

1. **Analysis Phase**: Scan the project to identify unused files, directories, and dependencies
2. **Validation Phase**: Cross-reference findings with active code to ensure no essential components are removed
3. **Cleanup Phase**: Remove identified items in a safe, reversible manner
4. **Verification Phase**: Ensure the project still functions correctly after cleanup

## Components and Interfaces

### File System Analyzer
- **Purpose**: Identify unused files and directories
- **Input**: Project directory structure
- **Output**: List of files/directories marked for removal
- **Logic**: 
  - Scan for references to training/ and data/ directories
  - Identify unused configuration files
  - Find orphaned documentation files

### Dependency Analyzer
- **Purpose**: Identify unused dependencies in package.json and requirements.txt
- **Input**: Package configuration files and source code
- **Output**: List of unused dependencies
- **Logic**:
  - Parse import statements in Python and JavaScript files
  - Cross-reference with declared dependencies
  - Identify packages not referenced in active code

### Configuration Cleaner
- **Purpose**: Remove or update configuration references to removed components
- **Input**: Configuration files (docker-compose.yml, steering files, etc.)
- **Output**: Updated configuration files
- **Logic**:
  - Remove training service from docker-compose.yml
  - Update steering files to remove training references
  - Clean up .gitignore entries for removed directories

### Documentation Updater
- **Purpose**: Update documentation to reflect cleaned project structure
- **Input**: Documentation files and project structure
- **Output**: Updated documentation
- **Logic**:
  - Ensure PROJECT_STRUCTURE.md reflects actual structure
  - Update README.md to remove references to removed features
  - Clean up any outdated setup instructions

## Data Models

### CleanupItem
```typescript
interface CleanupItem {
  path: string;
  type: 'file' | 'directory' | 'dependency' | 'config_reference';
  reason: string;
  risk_level: 'low' | 'medium' | 'high';
  references: string[];
}
```

### CleanupReport
```typescript
interface CleanupReport {
  items_removed: CleanupItem[];
  items_updated: CleanupItem[];
  dependencies_removed: string[];
  size_saved: number;
  warnings: string[];
}
```

## Error Handling

### File System Errors
- **Scenario**: Permission denied when deleting files
- **Handling**: Log error and continue with other items, report at end
- **Recovery**: Provide manual cleanup instructions

### Dependency Conflicts
- **Scenario**: Removing a dependency that's actually needed
- **Handling**: Validate all imports before removal, maintain backup list
- **Recovery**: Provide rollback instructions with specific package versions

### Configuration Errors
- **Scenario**: Breaking configuration files during cleanup
- **Handling**: Validate configuration syntax after each change
- **Recovery**: Keep backup of original configuration files

## Testing Strategy

### Unit Tests
- Test file system analyzer with mock directory structures
- Test dependency analyzer with sample package files
- Test configuration cleaner with various config formats
- Test documentation updater with different doc structures

### Integration Tests
- Test full cleanup process on a copy of the project
- Verify project still builds and runs after cleanup
- Test rollback procedures work correctly
- Validate all API endpoints still function

### Manual Testing
- Run cleanup on development environment
- Verify frontend loads correctly
- Test backend API endpoints
- Confirm Docker Compose still works
- Check that start scripts function properly

## Implementation Details

### Phase 1: Configuration Cleanup
Based on current analysis, the following items need cleanup:

1. **docker-compose.yml**: Remove training service section
2. **Steering files**: Update tech.md and structure.md to remove training references
3. **.gitignore**: Clean up entries for removed directories
4. **Spec files**: Update or remove training-pipeline spec

### Phase 2: Documentation Alignment
1. **README.md**: Remove training-related sections and commands
2. **PROJECT_STRUCTURE.md**: Ensure it matches actual structure
3. **Steering files**: Update to reflect current architecture

### Phase 3: Dependency Optimization
1. **backend/requirements.txt**: Remove ML training dependencies if not used by API
2. **frontend/package.json**: Remove unused development dependencies
3. **Verify imports**: Ensure all remaining dependencies are actually used

### Phase 4: Final Validation
1. **Build test**: Ensure project builds successfully
2. **Runtime test**: Verify all services start correctly
3. **API test**: Confirm all endpoints respond properly
4. **Frontend test**: Verify UI loads and functions

## Security Considerations

- Backup important configuration files before modification
- Validate that no API keys or secrets are accidentally removed
- Ensure .env and .env.example files remain intact
- Preserve all security-related configurations

## Performance Impact

- Reduced project size will improve clone and build times
- Fewer dependencies will reduce installation time
- Cleaner structure will improve developer navigation
- Simplified configuration will reduce startup complexity