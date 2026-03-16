/**
 * React Hooks for Rules & Policy Engine
 * Provides easy-to-use hooks for rule and policy operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
    ruleService,
    policyService,
    ruleTemplateService,
    Rule,
    Policy,
    RuleTemplate,
    RuleFilter,
    PolicyFilter,
    CreateRuleDto,
    UpdateRuleDto,
    CreatePolicyDto,
    UpdatePolicyDto,
    RuleType,
    RuleStatus,
    RuleContext,
    RuleEvaluationResult,
    PolicyEvaluationResult
} from '@/services/ruleService';

// ============================================================================
// RULE HOOKS
// ============================================================================

/**
 * Hook to fetch and manage rules
 */
export function useRules(filters?: RuleFilter) {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [meta, setMeta] = useState<any>(null);

    const fetchRules = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ruleService.getRules(filters);
            setRules(response.data);
            setTotal(response.total);
            setMeta(response.meta);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch rules');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    return {
        rules,
        loading,
        error,
        total,
        meta,
        refetch: fetchRules
    };
}

/**
 * Hook to fetch a single rule by ID
 */
export function useRule(ruleId: string | null) {
    const [rule, setRule] = useState<Rule | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ruleId) {
            setRule(null);
            setLoading(false);
            return;
        }

        const fetchRule = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await ruleService.getRuleById(ruleId);
                setRule(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch rule');
            } finally {
                setLoading(false);
            }
        };

        fetchRule();
    }, [ruleId]);

    return { rule, loading, error };
}

/**
 * Hook to create a new rule
 */
export function useCreateRule() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createRule = async (data: CreateRuleDto): Promise<Rule | null> => {
        try {
            setLoading(true);
            setError(null);
            const rule = await ruleService.createRule(data);
            return rule;
        } catch (err: any) {
            setError(err.message || 'Failed to create rule');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { createRule, loading, error };
}

/**
 * Hook to update a rule
 */
export function useUpdateRule() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateRule = async (ruleId: string, data: UpdateRuleDto): Promise<Rule | null> => {
        try {
            setLoading(true);
            setError(null);
            const rule = await ruleService.updateRule(ruleId, data);
            return rule;
        } catch (err: any) {
            setError(err.message || 'Failed to update rule');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { updateRule, loading, error };
}

/**
 * Hook to delete a rule
 */
export function useDeleteRule() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteRule = async (ruleId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            await ruleService.deleteRule(ruleId);
            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to delete rule');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { deleteRule, loading, error };
}

/**
 * Hook to toggle rule status
 */
export function useToggleRuleStatus() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleStatus = async (ruleId: string, status: RuleStatus): Promise<Rule | null> => {
        try {
            setLoading(true);
            setError(null);
            const rule = await ruleService.toggleRuleStatus(ruleId, status);
            return rule;
        } catch (err: any) {
            setError(err.message || 'Failed to toggle rule status');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { toggleStatus, loading, error };
}

/**
 * Hook to evaluate rules
 */
export function useEvaluateRules() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<RuleEvaluationResult[]>([]);

    const evaluate = async (ruleType: RuleType, context: RuleContext): Promise<RuleEvaluationResult[]> => {
        try {
            setLoading(true);
            setError(null);
            const evaluationResults = await ruleService.evaluateRules(ruleType, context);
            setResults(evaluationResults);
            return evaluationResults;
        } catch (err: any) {
            setError(err.message || 'Failed to evaluate rules');
            return [];
        } finally {
            setLoading(false);
        }
    };

    return { evaluate, results, loading, error };
}

/**
 * Hook to get rule statistics
 */
export function useRuleStatistics(ruleId: string | null) {
    const [statistics, setStatistics] = useState<Rule['statistics'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ruleId) {
            setStatistics(null);
            setLoading(false);
            return;
        }

        const fetchStatistics = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await ruleService.getRuleStatistics(ruleId);
                setStatistics(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch rule statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [ruleId]);

    return { statistics, loading, error };
}

/**
 * Hook to get rules by type
 */
export function useRulesByType(ruleType: RuleType | null) {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ruleType) {
            setRules([]);
            setLoading(false);
            return;
        }

        const fetchRules = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await ruleService.getRulesByType(ruleType);
                setRules(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch rules by type');
            } finally {
                setLoading(false);
            }
        };

        fetchRules();
    }, [ruleType]);

    return { rules, loading, error };
}

// ============================================================================
// POLICY HOOKS
// ============================================================================

/**
 * Hook to fetch and manage policies
 */
export function usePolicies(filters?: PolicyFilter) {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [meta, setMeta] = useState<any>(null);

    const fetchPolicies = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await policyService.getPolicies(filters);
            setPolicies(response.data);
            setTotal(response.total);
            setMeta(response.meta);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch policies');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    return {
        policies,
        loading,
        error,
        total,
        meta,
        refetch: fetchPolicies
    };
}

/**
 * Hook to fetch a single policy by ID
 */
export function usePolicy(policyId: string | null) {
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!policyId) {
            setPolicy(null);
            setLoading(false);
            return;
        }

        const fetchPolicy = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await policyService.getPolicyById(policyId);
                setPolicy(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch policy');
            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
    }, [policyId]);

    return { policy, loading, error };
}

/**
 * Hook to create a new policy
 */
export function useCreatePolicy() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPolicy = async (data: CreatePolicyDto): Promise<Policy | null> => {
        try {
            setLoading(true);
            setError(null);
            const policy = await policyService.createPolicy(data);
            return policy;
        } catch (err: any) {
            setError(err.message || 'Failed to create policy');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { createPolicy, loading, error };
}

/**
 * Hook to update a policy
 */
export function useUpdatePolicy() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updatePolicy = async (policyId: string, data: UpdatePolicyDto): Promise<Policy | null> => {
        try {
            setLoading(true);
            setError(null);
            const policy = await policyService.updatePolicy(policyId, data);
            return policy;
        } catch (err: any) {
            setError(err.message || 'Failed to update policy');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { updatePolicy, loading, error };
}

/**
 * Hook to delete a policy
 */
export function useDeletePolicy() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deletePolicy = async (policyId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            await policyService.deletePolicy(policyId);
            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to delete policy');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { deletePolicy, loading, error };
}

/**
 * Hook to evaluate a policy
 */
export function useEvaluatePolicy() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PolicyEvaluationResult | null>(null);

    const evaluate = async (policyId: string, context: RuleContext): Promise<PolicyEvaluationResult | null> => {
        try {
            setLoading(true);
            setError(null);
            const evaluationResult = await policyService.evaluatePolicy(policyId, context);
            setResult(evaluationResult);
            return evaluationResult;
        } catch (err: any) {
            setError(err.message || 'Failed to evaluate policy');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { evaluate, result, loading, error };
}

/**
 * Hook to get policy statistics
 */
export function usePolicyStatistics(policyId: string | null) {
    const [statistics, setStatistics] = useState<Policy['statistics'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!policyId) {
            setStatistics(null);
            setLoading(false);
            return;
        }

        const fetchStatistics = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await policyService.getPolicyStatistics(policyId);
                setStatistics(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch policy statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [policyId]);

    return { statistics, loading, error };
}

// ============================================================================
// RULE TEMPLATE HOOKS
// ============================================================================

/**
 * Hook to fetch and manage rule templates
 */
export function useRuleTemplates(filters?: {
    ruleType?: RuleType;
    category?: string;
    isPublic?: boolean;
    searchText?: string;
    page?: number;
    limit?: number;
}) {
    const [templates, setTemplates] = useState<RuleTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [meta, setMeta] = useState<any>(null);

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ruleTemplateService.getRuleTemplates(filters);
            setTemplates(response.data);
            setTotal(response.total);
            setMeta(response.meta);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch rule templates');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    return {
        templates,
        loading,
        error,
        total,
        meta,
        refetch: fetchTemplates
    };
}

/**
 * Hook to fetch a single rule template by ID
 */
export function useRuleTemplate(templateId: string | null) {
    const [template, setTemplate] = useState<RuleTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!templateId) {
            setTemplate(null);
            setLoading(false);
            return;
        }

        const fetchTemplate = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await ruleTemplateService.getRuleTemplateById(templateId);
                setTemplate(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch rule template');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [templateId]);

    return { template, loading, error };
}

/**
 * Hook to create rule from template
 */
export function useCreateRuleFromTemplate() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createFromTemplate = async (
        templateId: string,
        data: { name: string;[key: string]: any }
    ): Promise<Rule | null> => {
        try {
            setLoading(true);
            setError(null);
            const rule = await ruleTemplateService.createRuleFromTemplate(templateId, data);
            return rule;
        } catch (err: any) {
            setError(err.message || 'Failed to create rule from template');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { createFromTemplate, loading, error };
}
