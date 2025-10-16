/**
 * Design System Developer Tools Index
 * Exports all developer tools and utilities
 */

// Main developer tools
export { default as ThemeCustomizer } from './ThemeCustomizer';
export { default as ComponentAuditor } from './ComponentAuditor';
export { default as MigrationGuide } from './MigrationGuide';

// CLI utilities (for Node.js environments)
export * from './cli';

/**
 * Developer tools configuration
 */
export const developerToolsConfig = {
    name: 'Superior UI Design System Developer Tools',
    version: '1.0.0',
    description: 'Comprehensive developer tools for building and maintaining design systems',
    tools: [
        {
            id: 'theme-customizer',
            name: 'Theme Customizer',
            description: 'Interactive theme customization with real-time preview',
            component: 'ThemeCustomizer',
            category: 'design',
            features: [
                'Real-time theme preview',
                'Color palette customization',
                'Typography settings',
                'Spacing and layout controls',
                'Export to multiple formats'
            ]
        },
        {
            id: 'component-auditor',
            name: 'Component Auditor',
            description: 'Automated component quality and consistency checking',
            component: 'ComponentAuditor',
            category: 'quality',
            features: [
                'Accessibility compliance checking',
                'Performance analysis',
                'Consistency validation',
                'Documentation coverage',
                'Test coverage analysis'
            ]
        },
        {
            id: 'migration-guide',
            name: 'Migration Guide',
            description: 'Step-by-step migration assistance between versions',
            component: 'MigrationGuide',
            category: 'maintenance',
            features: [
                'Interactive migration steps',
                'Breaking changes overview',
                'Automated migration scripts',
                'Progress tracking',
                'Migration reports'
            ]
        },
        {
            id: 'cli-tools',
            name: 'CLI Tools',
            description: 'Command-line utilities for component generation and maintenance',
            component: 'CLI',
            category: 'development',
            features: [
                'Component generation',
                'Theme creation',
                'Component auditing',
                'Build automation',
                'Migration assistance'
            ]
        }
    ]
};

/**
 * Tool categories
 */
export const toolCategories = {
    design: {
        name: 'Design Tools',
        description: 'Tools for customizing and designing your system',
        icon: '🎨',
        tools: ['theme-customizer']
    },
    quality: {
        name: 'Quality Assurance',
        description: 'Tools for ensuring component quality and consistency',
        icon: '🔍',
        tools: ['component-auditor']
    },
    maintenance: {
        name: 'Maintenance',
        description: 'Tools for maintaining and upgrading your system',
        icon: '🔧',
        tools: ['migration-guide']
    },
    development: {
        name: 'Development',
        description: 'Tools for building and developing components',
        icon: '⚡',
        tools: ['cli-tools']
    }
};

/**
 * Usage examples for developer tools
 */
export const toolUsageExamples = {
    themeCustomizer: `import { ThemeCustomizer } from '@superior-ui/tools';

function DesignApp() {
  return (
    <div>
      <h1>Customize Your Theme</h1>
      <ThemeCustomizer />
    </div>
  );
}`,

    componentAuditor: `import { ComponentAuditor } from '@superior-ui/tools';

function QualityApp() {
  return (
    <div>
      <h1>Component Quality Dashboard</h1>
      <ComponentAuditor />
    </div>
  );
}`,

    migrationGuide: `import { MigrationGuide } from '@superior-ui/tools';

function MigrationApp() {
  return (
    <div>
      <h1>Migration Assistant</h1>
      <MigrationGuide />
    </div>
  );
}`,

    cliUsage: `# Generate a new component
npx superior-ui generate MyButton atom

# Create a custom theme
npx superior-ui theme --name dark --primary "#1a1a1a"

# Audit all components
npx superior-ui audit

# Generate migration guide
npx superior-ui migrate 1.0.0 2.0.0

# Build the design system
npx superior-ui build`
};

/**
 * Developer tools utilities
 */
export const developerUtils = {
    /**
     * Get tool by ID
     */
    getTool: (toolId) => {
        return developerToolsConfig.tools.find(tool => tool.id === toolId);
    },

    /**
     * Get tools by category
     */
    getToolsByCategory: (category) => {
        return developerToolsConfig.tools.filter(tool => tool.category === category);
    },

    /**
     * Get all available categories
     */
    getCategories: () => {
        return Object.keys(toolCategories);
    },

    /**
     * Check if a tool is available
     */
    isToolAvailable: (toolId) => {
        return developerToolsConfig.tools.some(tool => tool.id === toolId);
    },

    /**
     * Get tool usage example
     */
    getUsageExample: (toolId) => {
        const exampleKey = toolId.replace('-', '');
        return toolUsageExamples[exampleKey] || null;
    }
};

/**
 * Installation and setup instructions
 */
export const setupInstructions = {
    installation: {
        npm: 'npm install @superior-ui/design-system @superior-ui/tools',
        yarn: 'yarn add @superior-ui/design-system @superior-ui/tools',
        pnpm: 'pnpm add @superior-ui/design-system @superior-ui/tools'
    },

    setup: `// Import the tools you need
import { 
  ThemeCustomizer, 
  ComponentAuditor, 
  MigrationGuide 
} from '@superior-ui/tools';

// Use in your development environment
function DeveloperDashboard() {
  return (
    <div>
      <ThemeCustomizer />
      <ComponentAuditor />
      <MigrationGuide />
    </div>
  );
}`,

    cliSetup: `# Install CLI globally
npm install -g @superior-ui/cli

# Or use with npx
npx superior-ui --help

# Initialize in your project
superior-ui init`,

    configuration: `// Optional: Configure tools
export const toolsConfig = {
  themeCustomizer: {
    enableExport: true,
    defaultTheme: 'dark'
  },
  componentAuditor: {
    strictMode: true,
    autoFix: false
  },
  migrationGuide: {
    autoBackup: true,
    confirmSteps: true
  }
};`
};

/**
 * Best practices for using developer tools
 */
export const bestPractices = {
    themeCustomization: [
        'Start with the default theme and make incremental changes',
        'Test your theme with all component variants',
        'Ensure color contrast meets accessibility standards',
        'Export your theme configuration for version control',
        'Document your theme decisions for team members'
    ],

    componentAuditing: [
        'Run audits regularly as part of your CI/CD pipeline',
        'Address high-severity issues first',
        'Use automated fixes when available',
        'Document exceptions and their reasoning',
        'Set up audit thresholds for quality gates'
    ],

    migration: [
        'Always backup your code before starting migration',
        'Read the full migration guide before beginning',
        'Test thoroughly after each migration step',
        'Update your documentation after migration',
        'Consider gradual migration for large codebases'
    ],

    cliUsage: [
        'Use consistent naming conventions for generated components',
        'Customize templates to match your team\'s standards',
        'Integrate CLI commands into your build process',
        'Version control your CLI configuration',
        'Train team members on CLI usage'
    ]
};

/**
 * Troubleshooting guide
 */
export const troubleshooting = {
    common: [
        {
            issue: 'Theme changes not applying',
            solution: 'Ensure CSS custom properties are properly loaded and theme provider is wrapping your app'
        },
        {
            issue: 'Component audit failing',
            solution: 'Check that all required dependencies are installed and components are properly exported'
        },
        {
            issue: 'Migration script errors',
            solution: 'Verify your project structure matches expected patterns and backup your code first'
        },
        {
            issue: 'CLI commands not working',
            solution: 'Ensure you\'re in the correct directory and have proper permissions'
        }
    ],

    support: {
        documentation: 'https://superior-ui.dev/docs/tools',
        issues: 'https://github.com/superior-ui/design-system/issues',
        discussions: 'https://github.com/superior-ui/design-system/discussions',
        discord: 'https://discord.gg/superior-ui'
    }
};

export default {
    ThemeCustomizer,
    ComponentAuditor,
    MigrationGuide,
    developerToolsConfig,
    toolCategories,
    toolUsageExamples,
    developerUtils,
    setupInstructions,
    bestPractices,
    troubleshooting
};