'use client';

import { Github, GitBranch, Link as LinkIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface CodeRepositorySectionProps {
    repoUrl: string;
    branch: string;
    onRepoUrlChange: (url: string) => void;
    onBranchChange: (branch: string) => void;
    // New props for smart flow
    isCheckingAccess: boolean;
    isValidated: boolean;
    availableBranches: string[];
    isScanning: boolean;
}

export function CodeRepositorySection({
    repoUrl,
    branch,
    onRepoUrlChange,
    onBranchChange,
    isCheckingAccess,
    isValidated,
    availableBranches,
    isScanning,
}: CodeRepositorySectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-blue-600" />
                    <div>
                        <h3 className="text-lg font-semibold">Code Repository</h3>
                        <p className="text-sm text-muted-foreground">Link your agent&apos;s source code repository</p>
                    </div>
                </div>
                {/* Validation Status Badge */}
                {isValidated && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Validated
                    </span>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        Repository URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="https://github.com/username/repo"
                            value={repoUrl}
                            onChange={(e) => onRepoUrlChange(e.target.value)}
                            className={`w-full pl-10 pr-10 py-2.5 bg-muted border rounded-lg focus:ring-2 outline-none transition-all
                ${isValidated
                                    ? 'border-green-500 focus:ring-green-500'
                                    : 'border-border focus:ring-blue-500'
                                }`}
                        />
                        {/* Loading Indicator inside input */}
                        {isCheckingAccess && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                            </div>
                        )}
                        {/* Checkmark inside input */}
                        {!isCheckingAccess && isValidated && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">Public or private GitHub repository URL</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        Branch Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                        {/* Conditional Branch Input: Disabled until repo is validated */}
                        <select
                            value={branch}
                            onChange={(e) => onBranchChange(e.target.value)}
                            disabled={!isValidated || isCheckingAccess}
                            className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                        >
                            <option value="" disabled>
                                {isCheckingAccess ? "Fetching branches..." : (!isValidated ? "Enter URL first..." : "Select a branch...")}
                            </option>
                            {availableBranches.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>

                        {/* Dropdown arrow fix */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Select branch to trigger auto-scan</p>
                </div>
            </div>

            {isScanning && (
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg text-sm flex items-center gap-3 animate-pulse">
                    <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin shrink-0" />
                    <p className="font-medium">Scanning repository and extracting metadata...</p>
                </div>
            )}
        </div>
    );
}
