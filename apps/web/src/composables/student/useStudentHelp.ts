import { helpMap, aliasMap, type HelpContent } from './studentHelpData'

export function useStudentHelp(tabId: string): HelpContent {
  return helpMap[aliasMap[tabId] || tabId] || { title: 'مساعدة', sections: [] }
}
