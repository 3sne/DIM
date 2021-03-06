import { DtrD2ActivityModes, DtrReviewPlatform } from '@destinyitemmanager/dim-api-types';
import { DestinyAccount } from 'app/accounts/destiny-account';
import { currentAccountSelector } from 'app/accounts/selectors';
import { ThunkResult } from 'app/store/types';
import { D2Item } from '../inventory/item-types';
import { reviewsLoaded } from '../item-review/actions';
import { D2ItemReviewResponse, D2ItemUserReview } from '../item-review/d2-dtr-api-types';
import { getItemReviewsKey, getReviews } from '../item-review/reducer';
import { loadingTracker } from '../shell/loading-tracker';
import { getRollAndPerks } from './d2-itemTransformer';
import { handleD2Errors } from './d2-trackerErrorHandler';
import { dtrD2ReviewsEndpoint, dtrFetch } from './dtr-service-helper';
import { conditionallyIgnoreReviews } from './userFilter';
import { toUtcTime } from './util';

/**
 * Redux action that populates community (which may include the current user's) reviews for a given item.
 */
export function getItemReviewsD2(
  item: D2Item,
  platformSelection: DtrReviewPlatform,
  mode: DtrD2ActivityModes
): ThunkResult<D2ItemReviewResponse | undefined> {
  return async (dispatch, getState) => {
    if (!item.reviewable) {
      return undefined;
    }

    const existingReviews = getReviews(item, getState());

    // TODO: it'd be cool to mark these as "loading"
    if (existingReviews) {
      return existingReviews as D2ItemReviewResponse;
    }

    const returnedReviewsData = await getItemReviewsPromise(item, platformSelection, mode);
    const reviewData = translateReviewResponse(returnedReviewsData);
    markUserReview(currentAccountSelector(getState()), reviewData);
    await sortAndIgnoreReviews(reviewData);
    reviewData.lastUpdated = new Date();

    dispatch(
      reviewsLoaded({
        key: getItemReviewsKey(item),
        reviews: reviewData,
      })
    );
    return reviewData;
  };
}

function getItemReviewsPromise(
  item: D2Item,
  platformSelection: DtrReviewPlatform,
  mode: DtrD2ActivityModes
): Promise<D2ItemReviewResponse> {
  const dtrItem = getRollAndPerks(item);

  const queryString = `page=1&platform=${platformSelection}&mode=${mode}`;
  const promise = dtrFetch(
    `${dtrD2ReviewsEndpoint}?${queryString}`, // TODO: pagination
    dtrItem
  ).then(handleD2Errors, handleD2Errors);

  loadingTracker.addPromise(promise);

  return promise;
}

function translateReviewResponse(actualResponse: D2ItemReviewResponse): D2ItemReviewResponse {
  const reviews = actualResponse.reviews.map(translateReview);

  return { ...actualResponse, reviews };
}

function translateReview(returnedUserReview: D2ItemUserReview): D2ItemUserReview {
  const timestamp = toUtcTime((returnedUserReview.timestamp as any) as string);

  return {
    ...returnedUserReview,
    timestamp,
  };
}

function sortReviews(a: D2ItemUserReview, b: D2ItemUserReview) {
  if (a.isReviewer) {
    return -1;
  }

  if (b.isReviewer) {
    return 1;
  }

  if (a.isHighlighted) {
    return -1;
  }

  if (b.isHighlighted) {
    return 1;
  }

  const ratingDiff = b.voted - a.voted;

  if (ratingDiff !== 0) {
    return ratingDiff;
  }

  const aDate = new Date(a.timestamp).getTime();
  const bDate = new Date(b.timestamp).getTime();

  return bDate - aDate;
}

async function sortAndIgnoreReviews(reviewResponse: D2ItemReviewResponse) {
  if (reviewResponse.reviews) {
    reviewResponse.reviews.sort(sortReviews);

    await conditionallyIgnoreReviews(reviewResponse.reviews);
  }
}

function markUserReview(account: DestinyAccount | undefined, reviewData: D2ItemReviewResponse) {
  if (!account) {
    return;
  }

  const membershipId = account.membershipId;

  reviewData.reviews.forEach((review) => {
    if (review.reviewer.membershipId === membershipId) {
      review.isReviewer = true;
    }
  });

  return reviewData;
}
