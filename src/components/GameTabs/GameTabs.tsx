import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { ActionsTab } from './ActionsTab/ActionsTab';
import { GTOStatsTab } from './GTOStatsTab/GTOStatsTab';
import { ResultsTab } from './ResultsTab/ResultsTab';
import { HistoryTab } from './HistoryTab/HistoryTab';
import { useGameContext } from '../../hooks/useGameContext';
import 'react-tabs/style/react-tabs.css';
import "./GameTabs.scss";

export function GameTabs() {
  const { showdown } = useGameContext();

  return (
    <div className="game-tabs-container">
      <Tabs className="game-tabs" defaultIndex={0}>
        <TabList className="tab-list">
          <Tab className="tab" selectedClassName="tab--selected">
            <span className="tab-icon">🎮</span>
            <span className="tab-label">Actions</span>
          </Tab>
          <Tab className="tab" selectedClassName="tab--selected">
            <span className="tab-icon">📊</span>
            <span className="tab-label">GTO Stats</span>
          </Tab>
          <Tab className="tab" selectedClassName="tab--selected" disabled={!showdown}>
            <span className="tab-icon">🏆</span>
            <span className="tab-label">Results</span>
          </Tab>
          <Tab className="tab" selectedClassName="tab--selected">
            <span className="tab-icon">📋</span>
            <span className="tab-label">History</span>
          </Tab>
        </TabList>

        {/* Actions Tab */}
        <TabPanel className="tab-panel">
          <ActionsTab />
        </TabPanel>

        {/* GTO Stats Tab */}
        <TabPanel className="tab-panel">
          <GTOStatsTab />
        </TabPanel>

        {/* Results Tab */}
        <TabPanel className="tab-panel">
          <ResultsTab />
        </TabPanel>

        {/* History Tab */}
        <TabPanel className="tab-panel">
          <HistoryTab />
        </TabPanel>
      </Tabs>
    </div>
  );
}