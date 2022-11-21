import { createFeatureSelector, createSelector } from "@ngrx/store";
import { Post } from "src/app/models/posts.model";
import { postsAdapter, PostsState } from "./posts.state";

import { RouterStateUrl } from './../../store/router/custom-serializer';
import { getCurrentRoute } from './../../store/router/router.selector';
import { RouterState } from '@angular/router';

export const POST_STATE_NAME = 'posts';

const getPostsState = createFeatureSelector<PostsState>(POST_STATE_NAME);

export const postsSelectors = postsAdapter.getSelectors();

// Old selector without ngrx entity
// export const getPosts = createSelector(getPostsState, state => {
//     return state.posts;
// });

export const getPosts = createSelector(getPostsState, postsSelectors.selectAll);

export const getPostEntities = createSelector(
  getPostsState,
  postsSelectors.selectEntities
);

// Nuevo selector - coge los datos del router de la store, antes de ngrx entity
// export const getPostById = createSelector(
//     getPosts,
//     getCurrentRoute,
//     (posts, route: RouterStateUrl) => {
//       return posts ? posts.find((post) => post._id === route.params['id']) : null;
//     }
//   );

// Nuevo selector - coge los datos del router de la store, despues de ngrx entity
export const getPostById = createSelector(
  getPostEntities,
  getCurrentRoute,
  (posts, route: RouterStateUrl) => {
    return posts ? posts[route.params['id']] : null;
  }
);