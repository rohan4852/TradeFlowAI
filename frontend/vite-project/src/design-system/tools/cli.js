#!/usr/bin/env node

/**
 * Superior UI Design System CLI
 * Command-line tools for component generation, theme customization, and system maintenance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * CLI Commands
 */
const COMMANDS = {
    GENERATE: 'generate',
    THEME: 'theme',
    AUDIT: 'audit',
    MIGRATE: 'migrate',
    BUILD: 'build',
    HELP: 'help'
};

/**
 * Component templates
 */
const COMPONENT_TEMPLATES = {
    atom: {
        template: `/**
 * {{componentName}} - Atomic Component
 * {{description}}
 */
import React from 'react';
import PropTypes from 'prop-types';
import './{{componentName}}.css';

const {{componentName}} = ({ 
    children,
    variant = 'default',
    size = 'medium',
    disabled = false,
    className = '',
    ...props 
}) => {
    const classes = [
        '{{kebabName}}',
        \`{{kebabName}}--\${variant}\`,
        \`{{kebabName}}--\${size}\`,
        disabled && '{{kebabName}}--disabled',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

{{componentName}}.propTypes = {
    children: PropTypes.node,
    variant: PropTypes.oneOf(['default', 'primary', 'secondary']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    disabled: PropTypes.bool,
    className: PropTypes.string
};

export default {{componentName}};`,

        styles: `.{{kebabName}} {
    /* Base styles */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--border-radius-md);
    font-family: var(--font-family-primary);
    font-weight: var(--font-weight-medium);
    transition: all 0.2s ease;
    cursor: pointer;
    user-select: none;
}

/* Variants */
.{{kebabName}}--default {
    background: var(--color-neutral-100);
    color: var(--color-neutral-900);
}

.{{kebabName}}--primary {
    background: var(--color-primary-500);
    color: white;
}

.{{kebabName}}--secondary {
    background: var(--color-secondary-500);
    color: white;
}

/* Sizes */
.{{kebabName}}--small {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-sm);
}

.{{kebabName}}--medium {
    padding: var(--spacing-3) var(--spacing-4);
    font-size: var(--font-size-base);
}

.{{kebabName}}--large {
    padding: var(--spacing-4) var(--spacing-6);
    font-size: var(--font-size-lg);
}

/* States */
.{{kebabName}}--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.{{kebabName}}:hover:not(.{{kebabName}}--disabled) {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.{{kebabName}}:active:not(.{{kebabName}}--disabled) {
    transform: translateY(0);
}`,

        test: `/**
 * {{componentName}} Component Tests
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {{componentName}} from './{{componentName}}';

describe('{{componentName}}', () => {
    test('renders correctly', () => {
        render(<{{componentName}}>Test Content</{{componentName}}>);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('applies variant classes correctly', () => {
        const { rerender } = render(<{{componentName}} variant="primary">Primary</{{componentName}}>);
        expect(screen.getByText('Primary')).toHaveClass('{{kebabName}}--primary');

        rerender(<{{componentName}} variant="secondary">Secondary</{{componentName}}>);
        expect(screen.getByText('Secondary')).toHaveClass('{{kebabName}}--secondary');
    });

    test('applies size classes correctly', () => {
        const { rerender } = render(<{{componentName}} size="small">Small</{{componentName}}>);
        expect(screen.getByText('Small')).toHaveClass('{{kebabName}}--small');

        rerender(<{{componentName}} size="large">Large</{{componentName}}>);
        expect(screen.getByText('Large')).toHaveClass('{{kebabName}}--large');
    });

    test('handles disabled state', () => {
        render(<{{componentName}} disabled>Disabled</{{componentName}}>);
        expect(screen.getByText('Disabled')).toHaveClass('{{kebabName}}--disabled');
    });

    test('applies custom className', () => {
        render(<{{componentName}} className="custom-class">Custom</{{componentName}}>);
        expect(screen.getByText('Custom')).toHaveClass('custom-class');
    });
});`,

        stories: `/**
 * {{componentName}} Stories
 */
import {{componentName}} from './{{componentName}}';

export default {
    title: 'Atoms/{{componentName}}',
    component: {{componentName}},
    parameters: {
        docs: {
            description: {
                component: '{{description}}'
            }
        }
    },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['default', 'primary', 'secondary']
        },
        size: {
            control: { type: 'select' },
            options: ['small', 'medium', 'large']
        },
        disabled: {
            control: { type: 'boolean' }
        }
    }
};

const Template = (args) => <{{componentName}} {...args}>{{componentName}} Content</{{componentName}}>;

export const Default = Template.bind({});
Default.args = {
    variant: 'default',
    size: 'medium',
    disabled: false
};

export const Primary = Template.bind({});
Primary.args = {
    ...Default.args,
    variant: 'primary'
};

export const Secondary = Template.bind({});
Secondary.args = {
    ...Default.args,
    variant: 'secondary'
};

export const Small = Template.bind({});
Small.args = {
    ...Default.args,
    size: 'small'
};

export const Large = Template.bind({});
Large.args = {
    ...Default.args,
    size: 'large'
};

export const Disabled = Template.bind({});
Disabled.args = {
    ...Default.args,
    disabled: true
};`
    },

    molecule: {
        template: `/**
 * {{componentName}} - Molecular Component
 * {{description}}
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './{{componentName}}.css';

const {{componentName}} = ({ 
    children,
    title,
    variant = 'default',
    collapsible = false,
    defaultExpanded = true,
    onToggle,
    className = '',
    ...props 
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const handleToggle = () => {
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        onToggle?.(newExpanded);
    };

    const classes = [
        '{{kebabName}}',
        \`{{kebabName}}--\${variant}\`,
        collapsible && '{{kebabName}}--collapsible',
        !isExpanded && '{{kebabName}}--collapsed',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {title && (
                <div className="{{kebabName}}__header">
                    <h3 className="{{kebabName}}__title">{title}</h3>
                    {collapsible && (
                        <button 
                            className="{{kebabName}}__toggle"
                            onClick={handleToggle}
                            aria-expanded={isExpanded}
                        >
                            {isExpanded ? '−' : '+'}
                        </button>
                    )}
                </div>
            )}
            
            <div className="{{kebabName}}__content">
                {children}
            </div>
        </div>
    );
};

{{componentName}}.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'glass', 'elevated']),
    collapsible: PropTypes.bool,
    defaultExpanded: PropTypes.bool,
    onToggle: PropTypes.func,
    className: PropTypes.string
};

export default {{componentName}};`,

        styles: `.{{kebabName}} {
    /* Base styles */
    background: var(--color-neutral-50);
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    transition: all 0.3s ease;
}

.{{kebabName}}__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-4);
    border-bottom: 1px solid var(--color-neutral-200);
    background: var(--color-neutral-100);
}

.{{kebabName}}__title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-neutral-900);
}

.{{kebabName}}__toggle {
    background: none;
    border: none;
    font-size: var(--font-size-xl);
    cursor: pointer;
    padding: var(--spacing-1);
    border-radius: var(--border-radius-sm);
    transition: background-color 0.2s;
}

.{{kebabName}}__toggle:hover {
    background: var(--color-neutral-200);
}

.{{kebabName}}__content {
    padding: var(--spacing-4);
    transition: all 0.3s ease;
}

/* Variants */
.{{kebabName}}--glass {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(10px);
}

.{{kebabName}}--glass .{{kebabName}}__header {
    background: var(--glass-bg);
    border-bottom-color: var(--glass-border);
}

.{{kebabName}}--elevated {
    box-shadow: var(--shadow-lg);
    border: none;
}

/* States */
.{{kebabName}}--collapsed .{{kebabName}}__content {
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    overflow: hidden;
}

.{{kebabName}}--collapsible .{{kebabName}}__header {
    cursor: pointer;
}

.{{kebabName}}:hover {
    box-shadow: var(--shadow-md);
}`
    }
};

/**
 * Theme customization templates
 */
const THEME_TEMPLATES = {
    colors: `/**
 * Custom Color Theme
 * Generated by Superior UI Design System CLI
 */
export const customTheme = {
    colors: {
        primary: {
            50: '{{primary50}}',
            100: '{{primary100}}',
            200: '{{primary200}}',
            300: '{{primary300}}',
            400: '{{primary400}}',
            500: '{{primary500}}',
            600: '{{primary600}}',
            700: '{{primary700}}',
            800: '{{primary800}}',
            900: '{{primary900}}'
        },
        secondary: {
            50: '{{secondary50}}',
            100: '{{secondary100}}',
            200: '{{secondary200}}',
            300: '{{secondary300}}',
            400: '{{secondary400}}',
            500: '{{secondary500}}',
            600: '{{secondary600}}',
            700: '{{secondary700}}',
            800: '{{secondary800}}',
            900: '{{secondary900}}'
        },
        semantic: {
            success: '{{successColor}}',
            warning: '{{warningColor}}',
            error: '{{errorColor}}',
            info: '{{infoColor}}'
        },
        trading: {
            bullish: '{{bullishColor}}',
            bearish: '{{bearishColor}}',
            neutral: '{{neutralColor}}',
            volume: '{{volumeColor}}'
        }
    },
    
    // CSS Custom Properties
    cssVariables: {
        '--color-primary': '{{primary500}}',
        '--color-secondary': '{{secondary500}}',
        '--color-success': '{{successColor}}',
        '--color-warning': '{{warningColor}}',
        '--color-error': '{{errorColor}}',
        '--color-info': '{{infoColor}}',
        '--color-bullish': '{{bullishColor}}',
        '--color-bearish': '{{bearishColor}}',
        '--color-neutral': '{{neutralColor}}',
        '--color-volume': '{{volumeColor}}'
    }
};

export default customTheme;`,

    css: `:root {
    /* Primary Colors */
    --color-primary-50: {{primary50}};
    --color-primary-100: {{primary100}};
    --color-primary-200: {{primary200}};
    --color-primary-300: {{primary300}};
    --color-primary-400: {{primary400}};
    --color-primary-500: {{primary500}};
    --color-primary-600: {{primary600}};
    --color-primary-700: {{primary700}};
    --color-primary-800: {{primary800}};
    --color-primary-900: {{primary900}};

    /* Secondary Colors */
    --color-secondary-50: {{secondary50}};
    --color-secondary-100: {{secondary100}};
    --color-secondary-200: {{secondary200}};
    --color-secondary-300: {{secondary300}};
    --color-secondary-400: {{secondary400}};
    --color-secondary-500: {{secondary500}};
    --color-secondary-600: {{secondary600}};
    --color-secondary-700: {{secondary700}};
    --color-secondary-800: {{secondary800}};
    --color-secondary-900: {{secondary900}};

    /* Semantic Colors */
    --color-success: {{successColor}};
    --color-warning: {{warningColor}};
    --color-error: {{errorColor}};
    --color-info: {{infoColor}};

    /* Trading Colors */
    --color-bullish: {{bullishColor}};
    --color-bearish: {{bearishColor}};
    --color-neutral: {{neutralColor}};
    --color-volume: {{volumeColor}};
}`
};

/**
 * Utility functions
 */
const toPascalCase = (str) => {
    return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase());
};

const toKebabCase = (str) => {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const replaceTemplateVars = (template, vars) => {
    return Object.entries(vars).reduce((result, [key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        return result.replace(regex, value);
    }, template);
};

/**
 * Command implementations
 */
const generateComponent = (name, type = 'atom', description = '') => {
    const componentName = toPascalCase(name);
    const kebabName = toKebabCase(name);
    const template = COMPONENT_TEMPLATES[type];

    if (!template) {
        console.error(`❌ Unknown component type: ${type}`);
        console.log('Available types: atom, molecule');
        return;
    }

    const vars = {
        componentName,
        kebabName,
        description: description || `${componentName} component`
    };

    // Create component directory
    const componentDir = path.join(process.cwd(), 'src', 'design-system', 'components', componentName);
    ensureDir(componentDir);

    // Generate files
    const files = [
        { name: `${componentName}.jsx`, content: template.template },
        { name: `${componentName}.css`, content: template.styles },
        { name: `${componentName}.test.jsx`, content: template.test },
        { name: `${componentName}.stories.jsx`, content: template.stories }
    ];

    files.forEach(file => {
        const filePath = path.join(componentDir, file.name);
        const content = replaceTemplateVars(file.content, vars);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Created ${file.name}`);
    });

    // Create index file
    const indexContent = `export { default } from './${componentName}';`;
    fs.writeFileSync(path.join(componentDir, 'index.js'), indexContent);
    console.log(`✅ Created index.js`);

    console.log(`\n✓ Component ${componentName} generated successfully!`);
    console.log(`📁 Location: ${componentDir}`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Review and customize the generated files`);
    console.log(`2. Add the component to your design system exports`);
    console.log(`3. Run tests: npm test ${componentName}`);
    console.log(`4. View in Storybook: npm run storybook`);
};

const generateTheme = (options = {}) => {
    const {
        name = 'custom',
        primary = '#0ea5e9',
        secondary = '#64748b',
        success = '#10b981',
        warning = '#f59e0b',
        error = '#ef4444',
        info = '#3b82f6',
        bullish = '#4bffb5',
        bearish = '#ff4976',
        neutral = '#888888',
        volume = '#26a69a'
    } = options;

    // Generate color scales (simplified)
    const generateColorScale = (baseColor) => {
        // This is a simplified version - in a real implementation,
        // you'd use a proper color manipulation library
        return {
            50: baseColor + '0D',
            100: baseColor + '1A',
            200: baseColor + '33',
            300: baseColor + '4D',
            400: baseColor + '66',
            500: baseColor,
            600: baseColor + 'CC',
            700: baseColor + 'B3',
            800: baseColor + '99',
            900: baseColor + '80'
        };
    };

    const primaryScale = generateColorScale(primary);
    const secondaryScale = generateColorScale(secondary);

    const vars = {
        ...primaryScale,
        ...Object.fromEntries(Object.entries(secondaryScale).map(([k, v]) => [`secondary${k}`, v])),
        successColor: success,
        warningColor: warning,
        errorColor: error,
        infoColor: info,
        bullishColor: bullish,
        bearishColor: bearish,
        neutralColor: neutral,
        volumeColor: volume
    };

    // Create theme directory
    const themeDir = path.join(process.cwd(), 'src', 'design-system', 'themes', name);
    ensureDir(themeDir);

    // Generate theme files
    const jsContent = replaceTemplateVars(THEME_TEMPLATES.colors, vars);
    const cssContent = replaceTemplateVars(THEME_TEMPLATES.css, vars);

    fs.writeFileSync(path.join(themeDir, `${name}-theme.js`), jsContent);
    fs.writeFileSync(path.join(themeDir, `${name}-theme.css`), cssContent);

    console.log(`🎨 Theme "${name}" generated successfully!`);
    console.log(`📁 Location: ${themeDir}`);
    console.log(`\n📝 Usage:`);
    console.log(`import { customTheme } from './themes/${name}/${name}-theme';`);
    console.log(`// or import the CSS file directly`);
};

const auditComponents = () => {
    console.log('🔍 Auditing design system components...\n');

    const componentsDir = path.join(process.cwd(), 'src', 'design-system', 'components');

    if (!fs.existsSync(componentsDir)) {
        console.error('❌ Components directory not found');
        return;
    }

    const components = fs.readdirSync(componentsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const auditResults = {
        total: components.length,
        withTests: 0,
        withStories: 0,
        withDocs: 0,
        issues: []
    };

    components.forEach(componentName => {
        const componentDir = path.join(componentsDir, componentName);
        const files = fs.readdirSync(componentDir);

        const hasTest = files.some(file => file.includes('.test.'));
        const hasStory = files.some(file => file.includes('.stories.'));
        const hasReadme = files.includes('README.md');

        if (hasTest) auditResults.withTests++;
        if (hasStory) auditResults.withStories++;
        if (hasReadme) auditResults.withDocs++;

        // Check for issues
        if (!hasTest) {
            auditResults.issues.push(`${componentName}: Missing tests`);
        }
        if (!hasStory) {
            auditResults.issues.push(`${componentName}: Missing Storybook stories`);
        }
        if (!hasReadme) {
            auditResults.issues.push(`${componentName}: Missing documentation`);
        }
    });

    // Display results
    console.log('📊 Audit Results:');
    console.log(`Total Components: ${auditResults.total}`);
    console.log(`With Tests: ${auditResults.withTests}/${auditResults.total} (${Math.round(auditResults.withTests / auditResults.total * 100)}%)`);
    console.log(`With Stories: ${auditResults.withStories}/${auditResults.total} (${Math.round(auditResults.withStories / auditResults.total * 100)}%)`);
    console.log(`With Docs: ${auditResults.withDocs}/${auditResults.total} (${Math.round(auditResults.withDocs / auditResults.total * 100)}%)`);

    if (auditResults.issues.length > 0) {
        console.log('\n⚠️  Issues Found:');
        auditResults.issues.forEach(issue => console.log(`  • ${issue}`));
    } else {
        console.log('\n✅ No issues found!');
    }

    // Generate audit report
    const reportPath = path.join(process.cwd(), 'design-system-audit.json');
    fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
};

const generateMigrationGuide = (fromVersion, toVersion) => {
    const migrationGuide = `# Migration Guide: v${fromVersion} → v${toVersion}

## Overview
This guide helps you migrate from Superior UI Design System v${fromVersion} to v${toVersion}.

## Breaking Changes

### Component API Changes
- \`Button\` component now uses \`variant\` instead of \`type\` prop
- \`Input\` component \`error\` prop now accepts string instead of boolean

### CSS Class Changes
- \`.btn-primary\` → \`.button--primary\`
- \`.input-error\` → \`.input--error\`

### Import Changes
\`\`\`javascript
// Before (v${fromVersion})
import { Button } from '@/design-system/components/Button';

// After (v${toVersion})
import { Button } from '@/design-system';
\`\`\`

## Migration Steps

### 1. Update Dependencies
\`\`\`bash
npm install @superior-ui/design-system@${toVersion}
\`\`\`

### 2. Update Imports
Run the automated migration script:
\`\`\`bash
npx superior-ui migrate imports
\`\`\`

### 3. Update Component Props
\`\`\`javascript
// Before
<Button type="primary">Click me</Button>

// After
<Button variant="primary">Click me</Button>
\`\`\`

### 4. Update CSS Classes
\`\`\`css
/* Before */
.btn-primary { }

/* After */
.button--primary { }
\`\`\`

## Automated Migration

Run the automated migration tool:
\`\`\`bash
npx superior-ui migrate --from=${fromVersion} --to=${toVersion}
\`\`\`

## Testing Your Migration

1. Run your test suite: \`npm test\`
2. Check Storybook: \`npm run storybook\`
3. Perform visual regression testing
4. Test accessibility with the built-in tools

## Need Help?

- 📖 [Documentation](https://superior-ui.dev/docs)
- 🐛 [Report Issues](https://github.com/superior-ui/design-system/issues)
- 💬 [Community Discord](https://discord.gg/superior-ui)

---
Generated by Superior UI Design System CLI v${toVersion}
`;

    const migrationPath = path.join(process.cwd(), `migration-v${fromVersion}-to-v${toVersion}.md`);
    fs.writeFileSync(migrationPath, migrationGuide);

    console.log(`📋 Migration guide generated: ${migrationPath}`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Review the migration guide`);
    console.log(`2. Run: npx superior-ui migrate --from=${fromVersion} --to=${toVersion}`);
    console.log(`3. Test your application thoroughly`);
};

const buildDesignSystem = () => {
    console.log('🏗️  Building design system...\n');

    try {
        // Build components
        console.log('📦 Building components...');
        execSync('npm run build:components', { stdio: 'inherit' });

        // Build documentation
        console.log('📚 Building documentation...');
        execSync('npm run build:docs', { stdio: 'inherit' });

        // Build Storybook
        console.log('📖 Building Storybook...');
        execSync('npm run build-storybook', { stdio: 'inherit' });

        // Generate type definitions
        console.log('🔧 Generating TypeScript definitions...');
        execSync('npm run build:types', { stdio: 'inherit' });

        console.log('\n✅ Build completed successfully!');
        console.log('📁 Output directory: ./dist');

    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
};

const showHelp = () => {
    console.log(`
🎨 Superior UI Design System CLI

Usage: superior-ui <command> [options]

Commands:
  generate <name> [type]     Generate a new component
                            Types: atom, molecule (default: atom)
                            
  theme [options]           Generate a custom theme
                            Options: --name, --primary, --secondary, etc.
                            
  audit                     Audit components for completeness
  
  migrate <from> <to>       Generate migration guide
  
  build                     Build the entire design system
  
  help                      Show this help message

Examples:
  superior-ui generate MyButton atom
  superior-ui generate SearchBox molecule --description "Search input with filters"
  superior-ui theme --name dark --primary "#1a1a1a"
  superior-ui audit
  superior-ui migrate 1.0.0 2.0.0
  superior-ui build

Options:
  --description, -d         Component description
  --name, -n               Theme name
  --primary                Primary color
  --secondary              Secondary color
  --help, -h               Show help

For more information, visit: https://superior-ui.dev/docs/cli
`);
};

/**
 * Main CLI function
 */
const main = () => {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === COMMANDS.HELP) {
        showHelp();
        return;
    }

    switch (command) {
        case COMMANDS.GENERATE:
            const name = args[1];
            const type = args[2] || 'atom';
            const descIndex = args.indexOf('--description') || args.indexOf('-d');
            const description = descIndex > -1 ? args[descIndex + 1] : '';

            if (!name) {
                console.error('❌ Component name is required');
                console.log('Usage: superior-ui generate <name> [type]');
                return;
            }

            generateComponent(name, type, description);
            break;

        case COMMANDS.THEME:
            const themeOptions = {};
            for (let i = 1; i < args.length; i += 2) {
                const key = args[i].replace('--', '');
                const value = args[i + 1];
                if (value && !value.startsWith('--')) {
                    themeOptions[key] = value;
                }
            }
            generateTheme(themeOptions);
            break;

        case COMMANDS.AUDIT:
            auditComponents();
            break;

        case COMMANDS.MIGRATE:
            const fromVersion = args[1];
            const toVersion = args[2];

            if (!fromVersion || !toVersion) {
                console.error('❌ Both from and to versions are required');
                console.log('Usage: superior-ui migrate <from> <to>');
                return;
            }

            generateMigrationGuide(fromVersion, toVersion);
            break;

        case COMMANDS.BUILD:
            buildDesignSystem();
            break;

        default:
            console.error(`❌ Unknown command: ${command}`);
            showHelp();
            break;
    }
};

// Run CLI if called directly
if (require.main === module) {
    main();
}

module.exports = {
    generateComponent,
    generateTheme,
    auditComponents,
    generateMigrationGuide,
    buildDesignSystem,
    showHelp
};