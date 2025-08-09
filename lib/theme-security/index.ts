/**
 * Theme Security Scanner
 * Scans themes for security vulnerabilities and malicious code
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SecurityScanResult {
  safe: boolean;
  score: number; // 0-100
  threats: SecurityThreat[];
  warnings: SecurityWarning[];
  summary: {
    filesScanned: number;
    threatsFound: number;
    warningsFound: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface SecurityThreat {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  file?: string;
  line?: number;
  code?: string;
}

export interface SecurityWarning {
  type: string;
  message: string;
  file?: string;
  recommendation?: string;
}

// Dangerous patterns to detect
const SECURITY_PATTERNS = {
  critical: [
    { pattern: /eval\s*\(/, message: 'eval() can execute arbitrary code', type: 'code_execution' },
    { pattern: /Function\s*\(\s*['"`]/, message: 'Function constructor can execute arbitrary code', type: 'code_execution' },
    { pattern: /require\s*\(\s*['"`]child_process/, message: 'Child process execution detected', type: 'system_access' },
    { pattern: /exec\s*\(|execSync\s*\(/, message: 'System command execution detected', type: 'system_access' },
    { pattern: /import\s+.*['"`]fs['"`]/, message: 'File system access in client code', type: 'filesystem' },
    { pattern: /require\s*\(\s*['"`]fs['"`]/, message: 'File system access detected', type: 'filesystem' },
  ],
  high: [
    { pattern: /document\.write\s*\(/, message: 'document.write can cause XSS vulnerabilities', type: 'xss' },
    { pattern: /innerHTML\s*=(?!=\s*['"`]\s*['"`])/, message: 'Direct innerHTML assignment detected', type: 'xss' },
    { pattern: /dangerouslySetInnerHTML(?!\s*=\s*\{\s*\{\s*__html\s*:\s*DOMPurify)/, message: 'Unsafe HTML injection', type: 'xss' },
    { pattern: /window\.location\.href\s*=(?!=\s*['"`]\/|#)/, message: 'Potential open redirect', type: 'redirect' },
    { pattern: /fetch\s*\(\s*[^'"`]/, message: 'Dynamic fetch URL detected', type: 'network' },
  ],
  medium: [
    { pattern: /<script[^>]*>(?!.*<\/script>)/i, message: 'Inline script tag detected', type: 'script' },
    { pattern: /localStorage\.setItem\s*\(\s*[^'"`]/, message: 'Dynamic localStorage key', type: 'storage' },
    { pattern: /sessionStorage\.setItem\s*\(\s*[^'"`]/, message: 'Dynamic sessionStorage key', type: 'storage' },
    { pattern: /document\.cookie\s*=/, message: 'Direct cookie manipulation', type: 'cookie' },
    { pattern: /atob\s*\(|btoa\s*\(/, message: 'Base64 encoding/decoding detected', type: 'encoding' },
  ],
  low: [
    { pattern: /console\.(log|debug|info)/, message: 'Console logging in production', type: 'info_leak' },
    { pattern: /debugger/, message: 'Debugger statement found', type: 'debug' },
    { pattern: /TODO|FIXME|HACK/, message: 'Development comment found', type: 'quality' },
    { pattern: /process\.env(?!\.NODE_ENV)/, message: 'Environment variable access', type: 'config' },
  ]
};

// File types to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.html'];

// Maximum file size to scan (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export class ThemeSecurityScanner {
  private themeId: string;
  private themePath: string;
  private threats: SecurityThreat[] = [];
  private warnings: SecurityWarning[] = [];
  private filesScanned = 0;

  constructor(themeId: string) {
    this.themeId = themeId;
    this.themePath = path.join(process.cwd(), 'themes', themeId);
  }

  /**
   * Perform complete security scan
   */
  async scan(): Promise<SecurityScanResult> {
    this.threats = [];
    this.warnings = [];
    this.filesScanned = 0;

    try {
      // Get all files to scan
      const files = await this.getFilesToScan();
      
      // Scan each file
      for (const file of files) {
        await this.scanFile(file);
        this.filesScanned++;
      }

      // Check for suspicious file patterns
      await this.checkSuspiciousFiles();

      // Check permissions
      await this.checkPermissions();

      // Calculate security score
      const score = this.calculateSecurityScore();
      const riskLevel = this.determineRiskLevel(score);

      return {
        safe: this.threats.filter(t => t.severity === 'critical' || t.severity === 'high').length === 0,
        score,
        threats: this.threats,
        warnings: this.warnings,
        summary: {
          filesScanned: this.filesScanned,
          threatsFound: this.threats.length,
          warningsFound: this.warnings.length,
          riskLevel
        }
      };
    } catch (error) {
      console.error('[Security Scanner] Scan failed:', error);
      throw error;
    }
  }

  /**
   * Scan a single file for security issues
   */
  private async scanFile(filePath: string): Promise<void> {
    try {
      const stat = await fs.stat(filePath);
      
      // Skip large files
      if (stat.size > MAX_FILE_SIZE) {
        this.warnings.push({
          type: 'file_size',
          message: `File too large to scan: ${stat.size} bytes`,
          file: path.relative(this.themePath, filePath)
        });
        return;
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const relativeFile = path.relative(this.themePath, filePath);

      // Scan for security patterns
      for (const [severity, patterns] of Object.entries(SECURITY_PATTERNS)) {
        for (const { pattern, message, type } of patterns) {
          lines.forEach((line, index) => {
            if (pattern.test(line)) {
              // Skip if it's in a comment
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('/*')) {
                return;
              }

              this.threats.push({
                severity: severity as SecurityThreat['severity'],
                type,
                message,
                file: relativeFile,
                line: index + 1,
                code: line.trim().substring(0, 100)
              });
            }
          });
        }
      }

      // Additional checks for specific file types
      if (filePath.endsWith('.json')) {
        await this.scanJsonFile(filePath, content);
      } else if (filePath.endsWith('.html')) {
        await this.scanHtmlFile(filePath, content);
      }
    } catch (error) {
      console.error(`[Security Scanner] Failed to scan file ${filePath}:`, error);
    }
  }

  /**
   * Scan JSON files for security issues
   */
  private async scanJsonFile(filePath: string, content: string): Promise<void> {
    try {
      const json = JSON.parse(content);
      
      // Check for sensitive data patterns
      const sensitiveKeys = ['password', 'secret', 'token', 'apikey', 'private'];
      const checkObject = (obj: any, path = ''): void => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          // Check for sensitive keys
          if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            this.warnings.push({
              type: 'sensitive_data',
              message: `Potential sensitive data in key: ${currentPath}`,
              file: path.relative(this.themePath, filePath),
              recommendation: 'Avoid storing sensitive data in theme files'
            });
          }

          // Recurse into objects
          if (typeof value === 'object' && value !== null) {
            checkObject(value, currentPath);
          }
        }
      };

      checkObject(json);
    } catch (error) {
      // Invalid JSON is already caught by validation
    }
  }

  /**
   * Scan HTML files for security issues
   */
  private async scanHtmlFile(filePath: string, content: string): Promise<void> {
    const relativeFile = path.relative(this.themePath, filePath);

    // Check for inline scripts
    if (/<script[^>]*>[\s\S]*?<\/script>/gi.test(content)) {
      this.threats.push({
        severity: 'medium',
        type: 'inline_script',
        message: 'Inline script detected in HTML',
        file: relativeFile
      });
    }

    // Check for external script sources
    const scriptSrcPattern = /<script[^>]*src=["']([^"']+)["']/gi;
    let match;
    while ((match = scriptSrcPattern.exec(content)) !== null) {
      const src = match[1];
      if (src.startsWith('http://') || src.startsWith('//')) {
        this.threats.push({
          severity: 'high',
          type: 'external_script',
          message: `Insecure external script: ${src}`,
          file: relativeFile
        });
      }
    }
  }

  /**
   * Check for suspicious files
   */
  private async checkSuspiciousFiles(): Promise<void> {
    const suspiciousPatterns = [
      '.exe', '.dll', '.so', '.dylib', '.bat', '.sh', '.cmd',
      '.zip', '.rar', '.tar', '.gz', '.7z'
    ];

    const files = await this.getFilesToScan(false); // Get all files
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (suspiciousPatterns.includes(ext)) {
        this.threats.push({
          severity: 'high',
          type: 'suspicious_file',
          message: `Suspicious file type detected: ${ext}`,
          file: path.relative(this.themePath, file)
        });
      }

      // Check for hidden files
      const basename = path.basename(file);
      if (basename.startsWith('.') && basename !== '.gitignore') {
        this.warnings.push({
          type: 'hidden_file',
          message: `Hidden file detected: ${basename}`,
          file: path.relative(this.themePath, file)
        });
      }
    }
  }

  /**
   * Check file permissions
   */
  private async checkPermissions(): Promise<void> {
    try {
      const files = await this.getFilesToScan(false);
      
      for (const file of files) {
        const stat = await fs.stat(file);
        
        // Check for executable files
        if (stat.mode & 0o111) { // Any execute permission
          this.warnings.push({
            type: 'permissions',
            message: 'Executable file detected',
            file: path.relative(this.themePath, file),
            recommendation: 'Theme files should not be executable'
          });
        }
      }
    } catch (error) {
      console.error('[Security Scanner] Permission check failed:', error);
    }
  }

  /**
   * Get list of files to scan
   */
  private async getFilesToScan(filterByExtension = true): Promise<string[]> {
    const files: string[] = [];
    
    const scanDir = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scanDir(fullPath);
        } else if (entry.isFile()) {
          if (!filterByExtension || SCAN_EXTENSIONS.includes(path.extname(entry.name))) {
            files.push(fullPath);
          }
        }
      }
    };

    await scanDir(this.themePath);
    return files;
  }

  /**
   * Calculate security score (0-100)
   */
  private calculateSecurityScore(): number {
    let score = 100;

    // Deduct points for threats
    for (const threat of this.threats) {
      switch (threat.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    // Deduct points for warnings (less severe)
    score -= this.warnings.length * 2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 90) return 'low';
    if (score >= 70) return 'medium';
    if (score >= 50) return 'high';
    return 'critical';
  }

  /**
   * Generate security hash for theme
   */
  static async generateThemeHash(themePath: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    const files = await fs.readdir(themePath, { recursive: true, withFileTypes: true });
    
    for (const file of files) {
      if (file.isFile()) {
        const content = await fs.readFile(path.join(file.path, file.name));
        hash.update(content);
      }
    }
    
    return hash.digest('hex');
  }
}

// Export convenience function
export async function scanThemeSecurity(themeId: string): Promise<SecurityScanResult> {
  const scanner = new ThemeSecurityScanner(themeId);
  return scanner.scan();
}