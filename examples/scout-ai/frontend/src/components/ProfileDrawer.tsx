"use client";

import React, { useState } from "react";
import { User, X, Check, Plus, Trash2 } from "lucide-react";
import { ResearchProfile } from "../types";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ResearchProfile;
  onSaveProfile: (profile: ResearchProfile) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name || "Alex Rivers");
  const [skills, setSkills] = useState<string[]>(
    profile.skills?.length
      ? profile.skills
      : ["Python", "Distributed Systems", "FastAPI", "Playwright", "MicroVMs"]
  );
  const [newSkill, setNewSkill] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(profile.experience_years || 4.5);
  const [location, setLocation] = useState(profile.location || "San Francisco, CA / Remote");
  const [targetRoles, setTargetRoles] = useState<string[]>(
    profile.target_roles?.length
      ? profile.target_roles
      : ["Senior AI Infrastructure Engineer", "Backend Systems Engineer", "Agent Runtime Engineer"]
  );
  const [newRole, setNewRole] = useState("");
  const [resumeText, setResumeText] = useState(
    profile.resume_text ||
      "Systems engineer with 4+ years specializing in high-throughput cloud automation, Python/Rust runtimes, container sandboxing, and agent workflow architectures."
  );

  if (!isOpen) return null;

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAddRole = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    if (newRole.trim() && !targetRoles.includes(newRole.trim())) {
      setTargetRoles([...targetRoles, newRole.trim()]);
      setNewRole("");
    }
  };

  const handleRemoveRole = (role: string) => {
    setTargetRoles(targetRoles.filter((r) => r !== role));
  };

  const handleSave = () => {
    onSaveProfile({
      name,
      skills,
      experience_years: experienceYears,
      location,
      target_roles: targetRoles,
      resume_text: resumeText,
      preferences: {
        min_base_salary: "$180k",
        preferred_stage: ["Seed", "Series A", "Series B"],
        remote_friendly: true,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-cyan-950/40 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Target Researcher / Candidate Profile</h3>
              <p className="text-xs text-slate-400">ScoutAI uses this profile to calculate tailored match scores & outreach hooks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Name & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Full Name / Alias</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Experience (Years)</label>
              <input
                type="number"
                step="0.5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Location & Preference</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Technical Skills */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Core Technical Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-1 text-xs text-cyan-300"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Rust, ClickHouse, Docker)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-xl border border-slate-800 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
          </div>

          {/* Target Roles */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Target Roles / Focus Areas</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {targetRoles.map((role) => (
                <span
                  key={role}
                  className="flex items-center gap-1 rounded-lg bg-indigo-950/80 border border-indigo-500/30 px-2.5 py-1 text-xs text-indigo-300"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role)}
                    className="hover:text-rose-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add target role (e.g. AI Infra Engineer)"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={handleAddRole}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddRole}
                className="rounded-xl border border-slate-800 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
          </div>

          {/* Background / Bio */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Profile Summary / Resume Highlights</label>
            <textarea
              rows={3}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
