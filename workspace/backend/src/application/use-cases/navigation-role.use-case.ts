/**
 * Navigation & Role-Based Portals Use Case (AC-ROLE-NAV-01 to AC-ROLE-NAV-05)
 * Orchestrates 4 standardized user portal groups and dynamic role filtering:
 * 1. Runner Portal (5 items)
 * 2. Club & Team Space (5 items)
 * 3. Club Admin & Captain Portal (5 items)
 * 4. Super Admin / Platform (4 items)
 * Total: 19 standardized menu items with Context Switcher & Dynamic Sidebar
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import {
  PortalRoleId,
  PortalRoleDefinition,
  NavigationMenuItem,
  NavigationGroup,
  UserNavigationContext
} from '../../domain/models/models';

export class NavigationRoleUseCase {
  constructor(private readonly dataStore: InMemoryDataStore) {}

  /**
   * Retrieves the full navigation context for the current user,
   * including active portal role, available roles, and filtered menu groups.
   */
  getUserNavigationContext(userId: string = 'user-01'): UserNavigationContext {
    return this.dataStore.getUserNavigationContext(userId);
  }

  /**
   * Updates the active portal role for the user and returns the updated group count.
   */
  setActiveRole(userId: string = 'user-01', role: PortalRoleId): { success: boolean; activeRole: PortalRoleId; groupCount: number } {
    return this.dataStore.setUserActivePortalRole(userId, role);
  }

  /**
   * Retrieves all available portal role definitions for Context Switcher.
   */
  getPortalRoles(): PortalRoleDefinition[] {
    return this.dataStore.getPortalRoles();
  }

  /**
   * Retrieves all 4 navigation groups containing all 19 menu items.
   */
  getAllNavigationGroups(): NavigationGroup[] {
    return this.dataStore.getNavigationGroups();
  }

  /**
   * Retrieves a specific navigation group by ID.
   */
  getNavigationGroup(groupId: string): NavigationGroup | undefined {
    return this.dataStore.getNavigationGroups().find(g => g.id === groupId);
  }

  /**
   * Retrieves all menu items filtered by portal role.
   */
  getMenuItemsForRole(role: PortalRoleId): NavigationMenuItem[] {
    const groups = this.dataStore.getNavigationGroups();
    if (role === 'all') {
      return groups.flatMap(g => g.items);
    }
    const matchedGroup = groups.find(g => g.roleId === role);
    return matchedGroup ? matchedGroup.items : [];
  }

  /**
   * Finds a navigation item by its destination tab ID.
   */
  findMenuItemByTab(tabId: string): NavigationMenuItem | undefined {
    const aliasMap: Record<string, string> = {
      'club': 'club-feed',
      'admin': 'ops-quota',
      'activities': 'activities-all',
      'finance': 'athlete-debt'
    };
    const targetTab = aliasMap[tabId] || tabId;
    const groups = this.dataStore.getNavigationGroups();
    for (const group of groups) {
      const item = group.items.find(i => i.tabId === targetTab || i.tabId === tabId);
      if (item) return item;
    }
    return undefined;
  }
}

