export const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
] as const;

export const PRICE_TYPES = [
  { value: 'free', label: 'Free' },
  { value: 'discount', label: 'Discount' },
] as const;

export const VALID_PRICE_TYPES = new Set(PRICE_TYPES.map((p) => p.value));

export const ELIGIBILITY_TYPES = [
  { value: 'anyone', label: 'Anyone' },
  { value: 'student', label: 'Student' },
  { value: 'senior', label: 'Senior' },
  { value: 'kids', label: 'Kids' },
  { value: 'military', label: 'Military' },
  { value: 'snap', label: 'SNAP' },
  { value: 'income_requirement', label: 'Income Requirement' },
  { value: 'other', label: 'Other' },
] as const;

export const VALID_ELIGIBILITY_TYPES = new Set(ELIGIBILITY_TYPES.map((e) => e.value));

export const VENUE_TYPES = [
  { value: 'food_pantry', label: 'Food Pantry' },
  { value: 'food_bank', label: 'Food Bank' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'grocery_store', label: 'Grocery Store' },
  { value: 'farmers_market', label: 'Farmers Market' },
  { value: 'community_organization', label: 'Community Organization' },
  { value: 'other', label: 'Other' },
] as const;

export const VALID_VENUE_TYPES = new Set(VENUE_TYPES.map((v) => v.value));
export const DEFAULT_VENUE_TYPE = 'other';

export const selectClass =
  'h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 transition-[color,box-shadow,background-color]';

// Day abbreviations for the approval panel
export const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

// Navigation
export const BACK_LABEL = '← Back';
export const LOADING_LABEL = 'Loading…';

// Admin page
export const ADMIN_PAGE_TITLE = 'Admin: Upload Location';
export const SIGNED_IN_AS = 'Signed in as';
export const SIGN_OUT_LABEL = 'Sign out';
export const ACCESS_DENIED_TITLE = 'Access denied';
export const ACCESS_DENIED_MESSAGE = 'Your account does not have admin permissions.';
export const GO_HOME_LABEL = 'Go home';

// Admin sign-in form
export const ADMIN_SIGN_IN_TITLE = 'Admin Sign In';
export const ADMIN_SIGN_IN_SUBTITLE = 'You must be signed in as an admin to upload locations.';
export const ADMIN_EMAIL_PLACEHOLDER = 'admin@example.com';
export const SIGN_IN_LABEL = 'Sign In';
export const SIGNING_IN_LABEL = 'Signing in…';

// Upload form — mode selector
export const MODE_SELECTOR_HEADER = 'What would you like to do?';
export const UPLOAD_NEW_TITLE = 'Upload new data';
export const UPLOAD_NEW_DESC = 'Add a single business, location, or offer';
export const MODIFY_TITLE = 'Modify existing data';
export const MODIFY_DESC = 'Edit an existing offer and its locations';
export const APPROVE_TITLE = 'Approve pending data';
export const APPROVE_DESC = 'Review and approve or reject resources awaiting verification';

// Upload panel
export const UPLOAD_PANEL_TITLE = 'Upload new offers';
export const UPLOAD_PANEL_SUBTITLE = 'Search for an existing business or create a new one, then add a location and/or offer.';

// Business step
export const BUSINESS_STEP_LEGEND = 'Business';
export const BUSINESS_SEARCH_PLACEHOLDER = 'Search businesses by name…';
export const BUSINESS_SEARCHING_LABEL = 'Searching…';
export const CREATE_NEW_BUSINESS_PREFIX = '+ Create new business "';
export const CHANGE_BUSINESS_LABEL = 'Change business';

// Location step
export const LOCATION_STEP_LEGEND = 'Location';
export const ADD_NEW_LOCATION_LABEL = '+ Add a new location';
export const NO_LOCATION_LABEL = 'No location for this offer';

// Offer step
export const OFFER_STEP_LEGEND = 'Offer';
export const ADD_NEW_OFFER_LABEL = '+ Add a new offer';
export const OFFER_NAME_LABEL = 'Offer Name';

// Shared offer form labels
export const OFFER_DETAILS_LEGEND = 'Offer Details';
export const NAME_LABEL = 'Business Name';
export const DESCRIPTION_LABEL = 'Description';
export const VENUE_TYPE_LABEL = 'Venue Type';
export const OFFER_DESC_LABEL = 'Offer Description';
export const OFFER_SOURCE_LABEL = 'Offer Source';
export const PRICE_TYPE_LABEL = 'Price Type';
export const ELIGIBILITY_LABEL = 'Eligibility';
export const EXPIRES_AT_LABEL = 'Expires At';
export const ACTIVE_STATUS_LABEL = 'Active Status';
export const VERIFICATION_STATUS_LABEL = 'Verification Status';
export const NOTES_LABEL = 'Notes';

// Location form labels
export const LOCATION_LEGEND = 'Location';
export const ADDRESS_LABEL = 'Address';
export const ADDRESS2_LABEL = 'Address 2';
export const CITY_LABEL = 'City';
export const STATE_LABEL = 'State';
export const ZIP_CODE_LABEL = 'Zip Code';
export const NEIGHBORHOOD_LABEL = 'Neighborhood';
export const PHONE_LABEL = 'Phone Number';
export const LOCATION_NOTES_LABEL = 'Location Notes';

// Hours form
export const HOURS_LEGEND = 'Hours';
export const ADD_HOURS_LABEL = '+ Add hours';
export const REMOVE_LABEL = 'Remove';
export const SELECT_DAY_PLACEHOLDER = 'Select day';
export const OPENS_AT_LABEL = 'Opens at';
export const CLOSES_AT_LABEL = 'Closes at';
export const HOURS_NOTES_LABEL = 'Hours Notes';

// Status option labels
export const STATUS_NOT_SET = 'Not set';
export const STATUS_ACTIVE = 'Active';
export const STATUS_INACTIVE = 'Inactive';
export const STATUS_PENDING = 'Pending';
export const STATUS_APPROVED = 'Approved';
export const STATUS_REJECTED = 'Rejected';

// Submit / save states
export const SUBMITTING_LABEL = 'Submitting…';
export const SUBMIT_LABEL = 'Submit';
export const SAVING_LABEL = 'Saving…';
export const SAVE_CHANGES_LABEL = 'Save Changes';

// Success messages
export const OFFER_CREATED_SUCCESS = 'Offer created successfully.';
export const OFFER_UPDATED_SUCCESS = 'Offer updated successfully.';

// Fix required validation errors
export const VALIDATION_NAME_REQUIRED = 'Business name is required.';
export const VALIDATION_ADDRESS_REQUIRED = 'Address is required.';
export const VALIDATION_CITY_REQUIRED = 'City is required.';
export const VALIDATION_STATE_REQUIRED = 'State is required.';
export const VALIDATION_ZIP_REQUIRED = 'Zip code is required.';
export const VALIDATION_ERRORS_HEADER = 'Please fix the following:';
export const VALIDATION_BUSINESS_REQUIRED = 'Choose or create a business.';
export const VALIDATION_LOCATION_CHOICE_REQUIRED = 'Choose a location option.';
export const VALIDATION_OFFER_CHOICE_REQUIRED = 'Choose an offer option.';
export const VALIDATION_OFFER_NAME_REQUIRED = 'Offer name is required.';
export const VALIDATION_OFFER_NEEDS_LOCATION =
  'An existing offer can only be attached to a location — choose or add one.';

// Modify panel
export const MODIFY_PANEL_TITLE = 'Modify existing offer';
export const SELECT_OFFER_LABEL = 'Select an offer';
export const LOADING_OFFERS_LABEL = 'Loading offers…';
export const SELECT_OFFER_PLACEHOLDER = '— Select an offer —';
export const LOCATIONS_SECTION_TITLE = 'Locations';
export const NO_LOCATIONS_MESSAGE = 'No locations associated with this offer.';

// Approval panel
export const APPROVAL_PANEL_TITLE = 'Pending approval';
export const APPROVAL_PANEL_SUBTITLE = 'Review new resources and approve or reject them.';
export const ALL_CAUGHT_UP_TITLE = 'All caught up';
export const ALL_CAUGHT_UP_MESSAGE = 'No resources pending approval.';
export const APPROVE_LABEL = 'Approve';
export const REJECT_LABEL = 'Reject';
export const APPROVE_RESOURCE_LABEL = 'Approve resource';
export const OFFER_FIELD_LABEL = 'Offer: ';
export const SOURCE_FIELD_LABEL = 'Source: ';
export const HOURS_SECTION_LABEL = 'Hours';
