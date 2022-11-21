
import { map, mergeMap, switchMap, filter, withLatestFrom } from 'rxjs/operators';
import { 
  loadPosts, 
  loadPostsSuccess, 
  addPost, 
  addPostSuccess, 
  updatePost, 
  updatePostSuccess, 
  deletePost, 
  deletePostSuccess
} from './posts.actions';
import { getPosts } from './posts.selector';
import { PostsService } from './../../services/posts.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import {
  RouterNavigatedAction,
  routerNavigationAction,
  ROUTER_NAVIGATION,
} from '@ngrx/router-store';
import { Update } from '@ngrx/entity';
import { Post } from 'src/app/models/posts.model';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { of } from 'rxjs';
import { dummyAction } from 'src/app/auth/state/auth.actions';

@Injectable()
export class PostsEffects {
  constructor(private actions$: Actions, private postsService: PostsService, private store: Store<AppState>) {}

  // Old loadPosts effect
  // loadPosts$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(loadPosts),
  //     mergeMap((action) => {
  //       return this.postsService.getPosts().pipe(
  //         map((posts) => {
  //           return loadPostsSuccess({ posts });
  //         })
  //       );
  //     })
  //   );
  // });

  // New loadPosts effect improved perfomance avoiding aditional unnecessary requests
  loadPosts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadPosts),
      withLatestFrom(this.store.select(getPosts)),
      mergeMap(([action, posts]) => {
        if (!posts.length || posts.length === 1) {
          return this.postsService.getPosts().pipe(
            map((posts) => {
              return loadPostsSuccess({ posts });
            })
          );
        }
        return of(dummyAction());
      })
    );
  });

  // Opcion 1 - ver addPost metodo en el service --> public/src/app/services/posts.service.ts 
  addPost$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addPost),
      mergeMap((action) => {
        return this.postsService.addPost(action.post).pipe(
          map((post) => {
            return addPostSuccess({ post });
          })
        );
      })
    );
  });

  // Opcion 2 - ver addPost metodo en el service --> public/src/app/services/posts.service.ts
  // addPost$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(addPost),
  //     mergeMap((action) => {
  //       return this.postsService.addPost(action.post).pipe(
  //         map((post) => {
  //           const customPost = { post: { ...action.post, id: post.name } };
  //           return addPostSuccess(customPost);
  //         })
  //       );
  //     })
  //   );
  // });

  // Old update posts without ngrx entity
  // updatePost$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(updatePost),
  //     switchMap((action) => {
  //       return this.postsService.updatePost(action.post).pipe(
  //         map((data) => {
  //           return updatePostSuccess({ post: action.post });
  //         })
  //       );
  //     })
  //   );
  // });

  // New update posts with ngrx entity
  updatePost$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updatePost),
      switchMap((action) => {
        return this.postsService.updatePost(action.post).pipe(
          map((data) => {
            const updatedPost: Update<Post> = {
              id: action.post.id ? action.post.id.toString() : "0",
              changes: {
                ...action.post
              }
            };
            return updatePostSuccess({ post: updatedPost });
          })
        );
      })
    );
  });
  
  deletePost$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deletePost),
      switchMap((action) => {
        return this.postsService.deletePost(action.id).pipe(
          map((data) => {
            return deletePostSuccess({ id: action.id });
          })
        );
      })
    );
  });

  // Old getSinglePost effect
  // getSinglePost$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(ROUTER_NAVIGATION),
  //     filter((r: RouterNavigatedAction) => {
  //       return r.payload.routerState.url.startsWith('/posts/details');
  //     }),
  //     map((r: RouterNavigatedAction) => {
  //       // return r.payload.routerState['params']['id'];
  //       const currentId = isNaN(parseInt(r.payload.routerState.url.split("/")[3], 10)) ? "" : r.payload.routerState.url.split("/")[3];
  //       return currentId;
  //     }),
  //     switchMap((id) => {
  //       return this.postsService.getPostById(id).pipe(
  //         map((post) => {
  //           // const postData = [{ ...post, id }];
  //           // return loadPostsSuccess({ posts: postData });
  //           return loadPostsSuccess({ posts: [post] });
  //         })
  //       );
  //     })
  //   );
  // });

  // New getSinglePost effect to improve perfomance avoiding aditional unnecesssary requests
  getSinglePost$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      filter((r: RouterNavigatedAction) => {
        return r.payload.routerState.url.startsWith('/posts/details');
      }),
      map((r: RouterNavigatedAction) => {
        // return r.payload.routerState['params']['id'];
        const currentId = isNaN(parseInt(r.payload.routerState.url.split("/")[3], 10)) ? "" : r.payload.routerState.url.split("/")[3];
        return currentId;
      }),
      withLatestFrom(this.store.select(getPosts)),
      switchMap(([id, posts]) => {
        if (!posts.length) {
          return this.postsService.getPostById(id).pipe(
            map((post) => {
              const postData = [{ ...post, id }];
              return loadPostsSuccess({ posts: postData });
            })
          );
        }
        return of(dummyAction());
      })
    );
  });
}