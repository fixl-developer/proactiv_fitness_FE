import { create } from 'zustand';
import type {
    AthletePassport,
    SkillProgress,
    Milestone,
    PerformanceBenchmark,
    BehavioralTracking,
    Certification,
} from '@/types/passport';

interface PassportStore {
    passport: AthletePassport | null;
    skills: SkillProgress[];
    milestones: Milestone[];
    benchmarks: PerformanceBenchmark[];
    behaviors: BehavioralTracking[];
    certifications: Certification[];
    loading: boolean;

    setPassport: (passport: AthletePassport) => void;
    setSkills: (skills: SkillProgress[]) => void;
    setMilestones: (milestones: Milestone[]) => void;
    setBenchmarks: (benchmarks: PerformanceBenchmark[]) => void;
    setBehaviors: (behaviors: BehavioralTracking[]) => void;
    setCertifications: (certifications: Certification[]) => void;
    setLoading: (loading: boolean) => void;

    updateSkill: (skillId: string, skill: Partial<SkillProgress>) => void;
    addMilestone: (milestone: Milestone) => void;
    addBenchmark: (benchmark: PerformanceBenchmark) => void;
    addBehavior: (behavior: BehavioralTracking) => void;
}

export const usePassportStore = create<PassportStore>((set) => ({
    passport: null,
    skills: [],
    milestones: [],
    benchmarks: [],
    behaviors: [],
    certifications: [],
    loading: false,

    setPassport: (passport) => set({ passport }),
    setSkills: (skills) => set({ skills }),
    setMilestones: (milestones) => set({ milestones }),
    setBenchmarks: (benchmarks) => set({ benchmarks }),
    setBehaviors: (behaviors) => set({ behaviors }),
    setCertifications: (certifications) => set({ certifications }),
    setLoading: (loading) => set({ loading }),

    updateSkill: (skillId, updatedSkill) =>
        set((state) => ({
            skills: state.skills.map((skill) =>
                skill.id === skillId ? { ...skill, ...updatedSkill } : skill
            ),
        })),

    addMilestone: (milestone) =>
        set((state) => ({
            milestones: [...state.milestones, milestone],
        })),

    addBenchmark: (benchmark) =>
        set((state) => ({
            benchmarks: [...state.benchmarks, benchmark],
        })),

    addBehavior: (behavior) =>
        set((state) => ({
            behaviors: [...state.behaviors, behavior],
        })),
}));
