// src/data/qnaBank.js — module-scoped interview QnA bank, PL edition
// (SKELETON, 2026-07-16). Family schema (QNA-INTERVIEW-STANDARD):
//   QNA_BANK[moduleId] = { status: 'draft'|'parked'|'answered', questions: [
//     { id, level: 'L0'|'L1'|'L2'|'L3', q, status: 'draft'|'parked'|'answered', a? }
//   ] }
// Rules: question ids are frozen + module-agnostic; answers ONLY for modules
// whose contentStatus.js entry is 'clean'. Empty until the first parking wave.
export const QNA_BANK = {};
