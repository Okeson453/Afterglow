/* =========================================================
   data.js — fictional seed data for the discovery deck.
   Replace seedCandidates() with: GET /discovery/candidates
   ========================================================= */

const NAMES = ['Riya','Jasmine','Malik','Chidi','Nadia','Théo','Priya','Kofi','Selin','Mateo','Ama','Lucía','Yusuf','Ines','Diego','Zara'];
const TAGS_POOL = ['Night owl','Foodie','Traveler','Gym rat','Bookworm','Music head','Gamer','Dog person','Plant parent','Spontaneous','Coffee first','No drama'];
const BIOS = [
  "Looking for someone spontaneous — last-minute plans encouraged.",
  "Good conversation, better chemistry. Let's see what happens.",
  "Here tonight, here tomorrow if it's good. No pressure either way.",
  "Direct communicator. Say what you want, I'll say what I want.",
  "New in town, exploring. Show me your favorite spot."
];

function seedCandidates(n){
  const out = [];
  for(let i=0;i<n;i++){
    const name = NAMES[Math.floor(Math.random()*NAMES.length)];
    const age = 21 + Math.floor(Math.random()*14);
    const avatar = AVATARS[Math.floor(Math.random()*AVATARS.length)];
    const dist = (Math.random()*24+1).toFixed(1);
    const verified = Math.random() > 0.4;
    const tags = [...TAGS_POOL].sort(()=>0.5-Math.random()).slice(0,3);
    out.push({
      id:'c'+Date.now()+i+Math.random().toString(16).slice(2),
      name, age, avatar, dist, verified,
      bio: BIOS[Math.floor(Math.random()*BIOS.length)],
      tags
    });
  }
  return out;
}
