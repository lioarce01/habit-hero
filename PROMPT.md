# 🎮 HABIT HERO - ONE-SHOT PROMPT

Create a complete React application called "HABIT HERO" - a gamified habit tracker that transforms daily routines into an epic RPG adventure. This should feel like playing a real game, not just tracking habits.

## 🎯 CORE CONCEPT
Build a habit tracker that makes users feel like heroic adventurers. Every habit completion is a quest victory, every streak is legendary, and progress feels genuinely exciting and rewarding.

## 🏗️ ESSENTIAL FEATURES TO IMPLEMENT

### 1. HERO CREATION & AVATAR SYSTEM
- **Hero Setup Screen**: Name input + choose from 4 hero classes:
  - 🗡️ **Warrior** (Fitness focused) - Red theme, sword icon
  - 🧙‍♂️ **Mage** (Learning focused) - Blue theme, book icon  
  - 🛡️ **Paladin** (Health focused) - Gold theme, heart icon
  - 🏹 **Ranger** (Lifestyle focused) - Green theme, leaf icon
- **Visual Avatar**: Simple but distinctive character representation that shows current level
- **Hero Stats Display**: 4 core stats with visual bars:
  - ⚔️ **Power** (exercise, physical habits)
  - 🧠 **Wisdom** (reading, learning habits)  
  - ❤️ **Vitality** (health, wellness habits)
  - ⭐ **Spirit** (personal growth, mental habits)

### 2. QUEST SYSTEM (HABITS AS ADVENTURES)
- **Quest Creation**: Add habits as "Daily Quests" with:
  - Epic quest names (e.g., "The Morning Meditation Ritual", "Conquest of the 10K Steps")
  - Difficulty levels (Novice = 1pt, Adept = 2pts, Master = 3pts)
  - Which stat they boost
  - Custom descriptions that sound heroic
- **Active Quests Board**: Show today's incomplete quests with:
  - Fantasy-styled quest cards
  - Difficulty indicators (star ratings)
  - Estimated XP rewards
  - Time-sensitive styling for daily reset

### 3. EPIC PROGRESSION SYSTEM
- **Experience & Leveling**: 
  - Gain XP for quest completion (habit check-offs)
  - Level up system with satisfying animations
  - Each level requires more XP (level 1 = 100 XP, level 2 = 250 XP, etc.)
- **Dynamic Stat Growth**: Stats increase based on quest types completed
- **Streak Power**: Consecutive days multiply XP (2 days = 1.2x, 5 days = 1.5x, 10 days = 2x)
- **Level Milestones**: Every 5 levels unlocks new titles and avatar enhancements

### 4. HEROIC FEEDBACK SYSTEM
- **Quest Completion**: 
  - Dramatic success messages ("🎉 QUEST COMPLETED! You've mastered the ancient art of morning jogging!")
  - XP gain animations with sound effects (use CSS animations)
  - Stat increases with visual feedback
- **Achievement Unlocks**: Unlock titles and badges:
  - "Streak Warrior" (7-day streak)
  - "Dedication Master" (30-day streak)  
  - "Legendary Hero" (Level 20)
  - "Balanced Champion" (all stats above 50)

### 5. IMMERSIVE DASHBOARD EXPERIENCE
- **Hero's Journey Overview**:
  - Current level prominently displayed
  - Progress bar to next level
  - Today's completed/total quests
  - Current longest streak
- **Quest Log**: Clean, game-like interface showing:
  - ✅ Completed quests (with satisfaction checkmarks)
  - ⏳ Pending quests (call-to-action styling)
  - 🔥 Streak counters for each habit
- **Statistics Temple**: Weekly/monthly progress with:
  - XP earned over time
  - Most consistent quests
  - Stat evolution charts

## 🎨 VISUAL & UX REQUIREMENTS

### Design Philosophy: "EPIC FANTASY MEETS MODERN UI"
- **Color Scheme**: Dark theme with vibrant accents (gold, blue, green, red)
- **Typography**: Bold headings that feel heroic, readable body text
- **Animations**: Smooth, satisfying micro-interactions
- **Icons**: Use Lucide React icons with fantasy flair
- **Layout**: Card-based design with depth and shadows

### Critical UX Elements:
- **Instant Gratification**: Every action provides immediate visual feedback
- **Progress Visualization**: Multiple ways to see advancement (bars, numbers, levels)
- **Gamified Language**: Everything uses adventure/RPG terminology
- **Mobile-First**: Responsive design that works perfectly on phones

## 🔧 TECHNICAL SPECIFICATIONS

### React Component Structure:
```
App
├── HeroCreation (first-time setup)
├── Dashboard (main screen)
│   ├── HeroProfile (avatar, level, stats)
│   ├── QuestBoard (active habits)
│   ├── ProgressOverview (streaks, achievements)
└── QuestManager (add/edit habits)
```

### State Management & Database:
- **Supabase Integration**: Full backend with authentication and real-time data
- **Authentication System**: Complete login/register flow with Supabase Auth
- **Persistent Data**: All progress saved to cloud, accessible across devices
- **Real-time Updates**: Live data synchronization using Supabase hooks

## 🗄️ SUPABASE DATABASE ARCHITECTURE

### Database Schema:
```sql
-- Users table (managed by Supabase Auth)
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  hero_class TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  power_stat INTEGER DEFAULT 0,
  wisdom_stat INTEGER DEFAULT 0,
  vitality_stat INTEGER DEFAULT 0,
  spirit_stat INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quests table
CREATE TABLE quests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty INTEGER NOT NULL CHECK (difficulty IN (1, 2, 3)),
  stat_type TEXT NOT NULL CHECK (stat_type IN ('power', 'wisdom', 'vitality', 'spirit')),
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quest completions table (for tracking daily progress)
CREATE TABLE quest_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completed_at DATE DEFAULT CURRENT_DATE,
  xp_gained INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(quest_id, completed_at)
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own quests" ON quests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own completions" ON quest_completions FOR ALL USING (auth.uid() = user_id);
```
```javascript
// Hero object
hero: {
  name: string,
  class: string,
  level: number,
  xp: number,
  stats: { power, wisdom, vitality, spirit }
}

// Quest (habit) object  
quest: {
  id: string,
  name: string,
  description: string,
  difficulty: number,
  statType: string,
  streak: number,
  completedToday: boolean,
  lastCompleted: date
}
```

## 🎯 AUTHENTICATION & USER FLOW

### 1. Authentication Flow:
- **Login/Register Screen**: Clean, game-themed auth UI
- **Email + Password**: Standard Supabase authentication
- **Protected Routes**: Redirect to login if not authenticated
- **Session Management**: Handle login state across app refreshes

### 2. First-Time User Setup:
- **Post-Registration**: Create user profile in database
- **Hero Creation**: Choose class, enter name, initialize stats
- **Sample Quests**: Auto-create 2-3 demo quests for immediate engagement

### 3. Data Synchronization:
- **Real-time Updates**: Use Supabase realtime for live quest updates
- **Optimistic UI**: Update UI immediately, sync with database
- **Offline Handling**: Basic error handling for network issues

## 🔍 QUEST FILTERING SYSTEM

### Filter Options:
- **All Quests**: Show complete quest history
- **Active Quests**: Only currently active/enabled quests
- **Completed Today**: Quests completed in current day
- **Incomplete Today**: Active quests not yet completed today
- **By Streak**: Filter by current streak length (0, 1-7, 7+, 30+ days)
- **By Difficulty**: Filter by quest difficulty level (1-3 stars)
- **By Stat Type**: Filter by which stat the quest improves

### Filter UI Implementation:
```javascript
// Filter state management
const [questFilters, setQuestFilters] = useState({
  status: 'all', // 'all', 'active', 'completed-today', 'incomplete-today'
  difficulty: null, // null, 1, 2, 3
  statType: null, // null, 'power', 'wisdom', 'vitality', 'spirit'
  minStreak: 0
});

// Custom hook for filtered quests
const { filteredQuests, loading } = useFilteredQuests(questFilters);
```
## 🎮 CORE USER FLOW

1. **Authentication**: Login/Register with Supabase Auth
2. **Hero Creation**: Choose class, enter name, see initial stats (saved to users table)
3. **Quest Setup**: Create 3-4 daily habits with epic names (saved to quests table)
4. **Daily Ritual**: 
   - View filtered quest board (fetch from quests table)
   - Complete quests (save to quest_completions table)
   - See XP gains and stat increases (update users table)
   - Watch level progress (calculated from total_xp)
5. **Progress Tracking**: Filter and view quest history, streaks, and achievements

## 📊 SUPABASE HOOKS IMPLEMENTATION

### Essential Custom Hooks:
```javascript
// Authentication hook
const useAuth = () => {
  // Handle login, logout, user session
  // Return: { user, login, logout, loading }
}

// User profile hook
const useUserProfile = () => {
  // Fetch and update user stats, level, class
  // Return: { profile, updateProfile, loading }
}

// Quests hook with filtering
const useQuests = (filters = {}) => {
  // Fetch user's quests with applied filters
  // Return: { quests, addQuest, updateQuest, deleteQuest, loading }
}

// Quest completions hook
const useQuestCompletions = (questId) => {
  // Handle quest completion logic
  // Return: { completeQuest, getTodayStatus, getStreak, loading }
}

// Real-time updates hook
const useRealtimeQuests = () => {
  // Subscribe to real-time quest updates
  // Return: { quests, loading }
}
```

## 🚀 SUCCESS CRITERIA

The app should make users feel:
- **Excited** to complete daily habits
- **Proud** of their progress and achievements  
- **Motivated** to maintain streaks and level up
- **Immersed** in a genuine gaming experience

## 🎯 IMPLEMENTATION PRIORITIES

1. **Core Loop First**: Hero creation → Quest addition → Completion cycle
2. **Visual Polish**: Make it feel premium with animations and feedback
3. **Sample Content**: Include demo quests so it's immediately functional
4. **Mobile Optimized**: Ensure perfect mobile experience

## 💡 FINAL NOTES

- Focus on making HABIT COMPLETION feel like winning a boss battle
- Every interaction should have weight and consequence stored in Supabase
- The difference between this and other trackers should be immediately obvious
- Users should want to show this app to friends because it's genuinely cool
- **Data Persistence**: All progress must survive app restarts and device changes
- **Performance**: Use Supabase efficiently with proper query optimization
- **Security**: Implement proper RLS policies to protect user data

Build something that makes daily habits feel like the most epic adventure ever undertaken. This isn't just tracking - it's heroic transformation with bulletproof data persistence.

**MAKE IT LEGENDARY AND PERSISTENT.**