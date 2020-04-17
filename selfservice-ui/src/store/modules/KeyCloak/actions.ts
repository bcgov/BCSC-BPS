import { ActionTree } from 'vuex';
import { KeyCloakState } from './types';
import { RootState } from '../../types';
import KeycloakService from '@/services/keycloakservice';
import { UserService } from '@/services/userService';
// import axios from '@/lib/axios';
import router from '@/router';
// import { USER_URL } from '@/config/urlList';
// import { UserService } from '@/services/userService';

/**
 * Keycloak Actions
 *
 */
export const actions: ActionTree<KeyCloakState, RootState> = {
  setLogin({ commit }: any, login: any) {
    commit('SET_LOGIN', login);
  },

  /**
   * setKeyCloakAuth when token provide
   * @param {*} { commit }
   * @param {*} keycloak
   */
  async setKeyCloakAuth(state: any, data) {
    const { commit, dispatch } = state;
    const { keycloak, path, next, fromUrl } = data;

    const token = keycloak.token || false;
    if (token) {
      commit('SET_LOGIN', true);
      commit('SET_KEY_AUTH', { ...keycloak });
      commit('SET_TOKEN');
      sessionStorage.setItem('keycloak_token', token);
      try {
        const user = await UserService.getUser();
        if (user && user.data && user.data.verified) {
          dispatch('isVerified', true);
          dispatch('filedsToShow', user.data.fieldsRequired);
          dispatch('setProvider', user.data.provider);
          dispatch('setUserProfile', user.data.user);
          dispatch('userRedirect', { path, next, fromUrl });
          await UserService.updateUser();
        } else {
          dispatch('filedsToShow', user.data.fieldsRequired);
          dispatch('setProvider', user.data.provider);
          dispatch('setUserProfile', user.data.user);
          dispatch('isVerified', false);
          router.push({ path: '/profile/complete' });
        }
        commit('SET_USER_ERROR', false);
      } catch {
        commit('SET_USER_ERROR', true);
        if (path) {
          dispatch('userRedirect', { path, next, fromUrl });
        }
      }
    }
  },

  /**
   * setLogout remove token when user logout
   * @param {*} { commit }
   */
  setLogout({ commit }: any) {
    commit('SET_LOGOUT', false);
    sessionStorage.removeItem('keycloak_token');
    KeycloakService.logout();
  },
  /**
   * setUserProfile
   * @param {*} { commit }
   * @param {*} keycloak
   */
  setUserProfile({ commit }: any, profile: any) {
    commit('SET_USER_PROFILE', profile);
  },
  /**
   * setUserRole when token provide
   * @param {*} { commit }
   * @param {*} keycloak
   */
  setUserRole({ commit }: any, userRole: string[]) {
    let isAdmin = false;
    let isClient = false;

    if (userRole && userRole.length > 0) {
      const isadminRole = userRole.indexOf('ss_admin');
      if (isadminRole !== -1) {
        isAdmin = true;
      } else {
        const isClientRole = userRole.indexOf('ss_client');
        if (isClientRole !== -1) {
          isClient = true;
        }
      }
    }
    commit('SET_USER_ROLES', { isAdmin, isClient });
    commit('SET_TOKEN');
  },

  /**
   * setAuth when token provide
   * @param {*} { commit }
   * @param {*} keycloak
   */
  userRedirect(store: any, { path, next, fromUrl }) {
    if (fromUrl === '/profile/complete' && path === '/profile/complete') {
      router.push({ name: 'dashboard' });
    } else if (fromUrl === '/login' && path === '/login') {
      // if (store.state.isClient || store.state.isAdmin) {
      router.push({ path: '/dashboard' });
    } else if (fromUrl === '/login' && path !== '/login') {
      router.push({ path });
    } else if (next) {
      next();
    }
  },

  async updateProfile(state: any, profile: any) {
    const { dispatch, commit } = state;
    dispatch('clearStatus');
    try {
      const user = await UserService.createUser(profile.email, profile.phone);

      dispatch('setUserProfile', user.data);
      dispatch('isVerified', true);

      dispatch('userRedirect', {
        path: '/profile/complete',
        next: 'null',
        fromUrl: '/profile/complete'
      });
    } catch (error) {
      if (error.response.status === 400 && error.response.errors) {
        commit('SET_PROFILE_DOMAIN_ERROR', true);
      } else {
        commit('SET_USER_ERROR', true);
      }
    }
  },
  /**
   * isVerified
   * @param {*} { commit }
   * @param {*} status
   */
  isVerified({ commit }: any, status: any) {
    commit('SET_USER_VERFIED', status);
  },
  /**
   * filedsToShow
   * @param {*} { commit }
   * @param {*} status
   */
  filedsToShow({ commit }: any, fields: any) {
    commit('SET_FIELDS_TO_SHOW', fields);
  },
  /**
   * setProvider
   * @param {*} { commit }
   * @param {*} provider
   */
  setProvider({ commit }: any, provider: string) {
    commit('SET_PROVIDER', provider);
  },
  /**
   * clear message
   * @param {*} { commit }
   */
  async clearStatus({ commit }) {
    commit('SET_PROFILE_DOMAIN_ERROR', false);
    commit('SET_USER_ERROR', false);
  }
};
