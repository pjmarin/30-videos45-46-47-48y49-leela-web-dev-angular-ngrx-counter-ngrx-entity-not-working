import { Post } from './../../models/posts.model';
import { EntityState, createEntityAdapter } from '@ngrx/entity';

// Old state for posts  without ngrx entity

// export interface PostsState {
//   posts: Post[];
// }

// export const initialState: PostsState = {
//   posts: [],
// };

// New state for posts with ngrx entity

export interface PostsState extends EntityState<Post> {}

export const postsAdapter = createEntityAdapter<Post>();

export const initialState: PostsState = postsAdapter.getInitialState();