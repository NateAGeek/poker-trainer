import { useState } from 'react';
import { GameType, BettingDisplayMode, type GameSettings, type AIPersonality } from '../../types/poker';
import { AI_PERSONALITIES } from '../../utils/gameUtils';
import { AIRangeSettings } from '../AIRangeSettings';
import './GameSettings.scss';

interface GameSettingsProps {
  currentSettings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onResetSession?: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const PRESET_CASH_GAMES = [
  { name: 'Micro Stakes', smallBlind: 1, bigBlind: 2, startingStack: 200 },
  { name: 'Low Stakes', smallBlind: 5, bigBlind: 10, startingStack: 1000 },
  { name: 'Mid Stakes', smallBlind: 25, bigBlind: 50, startingStack: 5000 },
  { name: 'High Stakes', smallBlind: 100, bigBlind: 200, startingStack: 20000 },
];

const PRESET_MTT_STRUCTURES = [
  {
    name: 'Turbo',
    startingStack: 1500,
    blindLevels: [
      { level: 1, smallBlind: 10, bigBlind: 20, ante: 0, duration: 10 },
      { level: 2, smallBlind: 15, bigBlind: 30, ante: 0, duration: 10 },
      { level: 3, smallBlind: 25, bigBlind: 50, ante: 0, duration: 10 },
      { level: 4, smallBlind: 50, bigBlind: 100, ante: 10, duration: 10 },
      { level: 5, smallBlind: 75, bigBlind: 150, ante: 15, duration: 10 },
    ]
  },
  {
    name: 'Regular',
    startingStack: 3000,
    blindLevels: [
      { level: 1, smallBlind: 10, bigBlind: 20, ante: 0, duration: 15 },
      { level: 2, smallBlind: 15, bigBlind: 30, ante: 0, duration: 15 },
      { level: 3, smallBlind: 25, bigBlind: 50, ante: 0, duration: 15 },
      { level: 4, smallBlind: 50, bigBlind: 100, ante: 10, duration: 15 },
      { level: 5, smallBlind: 75, bigBlind: 150, ante: 15, duration: 15 },
    ]
  },
];

export function GameSettings({ currentSettings, onSettingsChange, onResetSession, onClose, isOpen }: GameSettingsProps) {
  const [settings, setSettings] = useState<GameSettings>(currentSettings);
  const [activeTab, setActiveTab] = useState<'basic' | 'blinds' | 'advanced'>('basic');

  if (!isOpen) return null;

  // Initialize AI personalities if not present
  const initializeAIPersonalities = (playerCount: number): AIPersonality[] => {
    const personalities: AIPersonality[] = [];
    const personalityTypes = Object.values(AI_PERSONALITIES);
    
    // Create AI personalities for players 2 through playerCount (skip player 1 who is human)
    for (let i = 1; i < playerCount; i++) {
      const personalityIndex = (i - 1) % personalityTypes.length;
      personalities.push({
        ...personalityTypes[personalityIndex],
        name: `${personalityTypes[personalityIndex].name} ${i + 1}` // Player numbers 2, 3, 4, etc.
      });
    }
    
    return personalities;
  };

  // Ensure AI personalities are initialized
  if (!settings.aiPersonalities || settings.aiPersonalities.length !== settings.playerCount - 1) {
    const newPersonalities = initializeAIPersonalities(settings.playerCount);
    setSettings(prev => ({ ...prev, aiPersonalities: newPersonalities }));
  }

  const handleSettingChange = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // If player count changes, update AI personalities
      if (key === 'playerCount') {
        newSettings.aiPersonalities = initializeAIPersonalities(value as number);
      }
      
      return newSettings;
    });
  };

  const handleAIPersonalitiesChange = (personalities: AIPersonality[]) => {
    setSettings(prev => ({ ...prev, aiPersonalities: personalities }));
  };

  const applyPreset = (preset: typeof PRESET_CASH_GAMES[0] | typeof PRESET_MTT_STRUCTURES[0]) => {
    if ('blindLevels' in preset) {
      // MTT preset
      setSettings(prev => ({
        ...prev,
        gameType: GameType.MTT,
        startingStack: preset.startingStack,
        smallBlind: preset.blindLevels[0].smallBlind,
        bigBlind: preset.blindLevels[0].bigBlind,
        ante: preset.blindLevels[0].ante,
        blindLevels: preset.blindLevels,
      }));
    } else {
      // Cash game preset
      setSettings(prev => ({
        ...prev,
        gameType: GameType.CASH,
        smallBlind: preset.smallBlind,
        bigBlind: preset.bigBlind,
        startingStack: preset.startingStack,
        blindLevels: undefined,
      }));
    }
  };

  const handleSave = () => {
    onSettingsChange(settings);
    onClose();
  };

  const handleCancel = () => {
    setSettings(currentSettings);
    onClose();
  };

  return (
    <div className="game-settings-overlay">
      <div className="game-settings-modal">
        <div className="game-settings-header">
          <h2>Game Settings</h2>
          <button className="close-button" onClick={handleCancel}>×</button>
        </div>

        <div className="game-settings-tabs">
          <button 
            className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic
          </button>
          <button 
            className={`tab ${activeTab === 'blinds' ? 'active' : ''}`}
            onClick={() => setActiveTab('blinds')}
          >
            Blinds & Stack
          </button>
          <button 
            className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
        </div>

        <div className="game-settings-content">
          {activeTab === 'basic' && (
            <div className="basic-settings">
              <div className="setting-group">
                <label>Game Type</label>
                <div className="game-type-buttons">
                  <button 
                    className={`game-type-btn ${settings.gameType === GameType.CASH ? 'active' : ''}`}
                    onClick={() => handleSettingChange('gameType', GameType.CASH)}
                  >
                    Cash Game
                  </button>
                  <button 
                    className={`game-type-btn ${settings.gameType === GameType.MTT ? 'active' : ''}`}
                    onClick={() => handleSettingChange('gameType', GameType.MTT)}
                  >
                    Tournament (MTT)
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label htmlFor="player-count">Number of Players</label>
                <select
                  id="player-count"
                  value={settings.playerCount}
                  onChange={(e) => handleSettingChange('playerCount', Number(e.target.value))}
                >
                  <option value={2}>2 Players (Heads-Up)</option>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players</option>
                  <option value={5}>5 Players</option>
                  <option value={6}>6 Players (6-Max)</option>
                  <option value={7}>7 Players</option>
                  <option value={8}>8 Players</option>
                  <option value={9}>9 Players (Full Ring)</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Betting Display</label>
                <div className="betting-display-buttons">
                  <button 
                    className={`betting-display-btn ${settings.bettingDisplayMode === BettingDisplayMode.BASE_AMOUNT ? 'active' : ''}`}
                    onClick={() => handleSettingChange('bettingDisplayMode', BettingDisplayMode.BASE_AMOUNT)}
                  >
                    Chip Values
                  </button>
                  <button 
                    className={`betting-display-btn ${settings.bettingDisplayMode === BettingDisplayMode.BIG_BLINDS ? 'active' : ''}`}
                    onClick={() => handleSettingChange('bettingDisplayMode', BettingDisplayMode.BIG_BLINDS)}
                  >
                    Big Blinds
                  </button>
                </div>
              </div>

              {settings.gameType === GameType.CASH && (
                <div className="preset-section">
                  <h3>Cash Game Presets</h3>
                  <div className="preset-buttons">
                    {PRESET_CASH_GAMES.map((preset) => (
                      <button
                        key={preset.name}
                        className="preset-btn"
                        onClick={() => applyPreset(preset)}
                      >
                        {preset.name}
                        <span className="preset-details">
                          {preset.smallBlind}/{preset.bigBlind} • Stack: {preset.startingStack}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {settings.gameType === GameType.MTT && (
                <div className="preset-section">
                  <h3>Tournament Presets</h3>
                  <div className="preset-buttons">
                    {PRESET_MTT_STRUCTURES.map((preset) => (
                      <button
                        key={preset.name}
                        className="preset-btn"
                        onClick={() => applyPreset(preset)}
                      >
                        {preset.name}
                        <span className="preset-details">
                          Starting Stack: {preset.startingStack}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'blinds' && (
            <div className="blinds-settings">
              <div className="setting-group">
                <label htmlFor="starting-stack">Starting Stack</label>
                <input
                  id="starting-stack"
                  type="number"
                  value={settings.startingStack}
                  onChange={(e) => handleSettingChange('startingStack', Number(e.target.value))}
                  min="100"
                  step="100"
                />
              </div>

              <div className="blinds-row">
                <div className="setting-group">
                  <label htmlFor="small-blind">Small Blind</label>
                  <input
                    id="small-blind"
                    type="number"
                    value={settings.smallBlind}
                    onChange={(e) => handleSettingChange('smallBlind', Number(e.target.value))}
                    min="1"
                  />
                </div>

                <div className="setting-group">
                  <label htmlFor="big-blind">Big Blind</label>
                  <input
                    id="big-blind"
                    type="number"
                    value={settings.bigBlind}
                    onChange={(e) => handleSettingChange('bigBlind', Number(e.target.value))}
                    min="2"
                  />
                </div>
              </div>

              {settings.gameType === GameType.MTT && (
                <div className="setting-group">
                  <label htmlFor="ante">Ante (Optional)</label>
                  <input
                    id="ante"
                    type="number"
                    value={settings.ante || 0}
                    onChange={(e) => handleSettingChange('ante', Number(e.target.value) || undefined)}
                    min="0"
                  />
                </div>
              )}

              <div className="stack-info">
                <h4>Stack Information</h4>
                <div className="stack-stats">
                  <div className="stat">
                    <span className="label">Starting Stack:</span>
                    <span className="value">{settings.startingStack} chips</span>
                  </div>
                  <div className="stat">
                    <span className="label">Big Blinds:</span>
                    <span className="value">{Math.floor(settings.startingStack / settings.bigBlind)} BB</span>
                  </div>
                  <div className="stat">
                    <span className="label">Blind Ratio:</span>
                    <span className="value">{settings.smallBlind}:{settings.bigBlind}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="advanced-settings">
              {settings.gameType === GameType.MTT && (
                <div className="blind-levels-section">
                  <h3>Blind Level Structure</h3>
                  <div className="blind-levels">
                    {settings.blindLevels?.map((level) => (
                      <div key={level.level} className="blind-level">
                        <div className="level-header">
                          Level {level.level} ({level.duration} min)
                        </div>
                        <div className="level-details">
                          SB: {level.smallBlind} | BB: {level.bigBlind}
                          {level.ante && level.ante > 0 && ` | Ante: ${level.ante}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="setting-group">
                <label>AI Player Configuration</label>
                {settings.aiPersonalities && settings.aiPersonalities.length > 0 ? (
                  <AIRangeSettings
                    personalities={settings.aiPersonalities}
                    onPersonalitiesChange={handleAIPersonalitiesChange}
                  />
                ) : (
                  <div className="no-ai-players">
                    <p>No AI players to configure. Increase the player count to add AI players.</p>
                  </div>
                )}
              </div>

              <div className="setting-group">
                <label>Additional Features</label>
                <div className="feature-toggles">
                  <label className="toggle-label">
                    <input type="checkbox" disabled />
                    <span>Auto-advance blinds (MTT)</span>
                    <small>Coming soon</small>
                  </label>
                  <label className="toggle-label">
                    <input type="checkbox" disabled />
                    <span>Side pot calculations</span>
                    <small>Coming soon</small>
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <label>Session Management</label>
                <div className="session-controls">
                  <button 
                    className="reset-session-btn danger"
                    onClick={() => {
                      if (onResetSession && window.confirm('Are you sure you want to reset your session? This will clear all hand history and statistics.')) {
                        onResetSession();
                        onClose();
                      }
                    }}
                  >
                    Reset Session
                  </button>
                  <small>This will clear all hand history and reset statistics to zero.</small>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="game-settings-footer">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}