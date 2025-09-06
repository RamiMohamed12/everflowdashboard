Advertisers
Operations for advertisers
Find All
GET /v1/networks/advertisers
Filters

This endpoint supports basic filtering. Refer to API filters page for usage.
Request Example
cURL

curl --request GET 'https://api.eflow.team/v1/networks/advertisers' \
--header 'X-Eflow-API-Key: <INSERT API KEY>'

Response

{
    "advertisers": [
        {
            "network_advertiser_id": 13,
            "network_id": 1,
            "name": "Gabielle Deleon Inc.",
            "account_status": "active",
            "network_employee_id": 1,
            "internal_notes": "",
            "address_id": 0,
            "is_contact_address_enabled": false,
            "sales_manager_id": 0,
            "is_expose_publisher_reporting_data": null,
            "default_currency_id": "USD",
            "platform_name": "",
            "platform_url": "",
            "platform_username": "",
            "reporting_timezone_id": 67,
            "accounting_contact_email": "",
            "verification_token": "",
            "offer_id_macro": "oid",
            "affiliate_id_macro": "affid",
            "time_created": 1582295424,
            "time_saved": 1582295424,
            "attribution_method": "last_touch",
            "email_attribution_method": "last_affiliate_attribution",
            "attribution_priority": "click",
            "relationship": {
                "labels": {
                    "total": 0,
                    "entries": []
                },
                "account_manager": {
                    "first_name": "Bob",
                    "last_name": "Smith",
                    "email": "my.everflow@gmail.com",
                    "work_phone": "8734215936",
                    "cell_phone": "",
                    "instant_messaging_id": 0,
                    "instant_messaging_identifier": ""
                },
                "integrations": {
                    "advertiser_demand_partner": null
                }
            }
        }
    ],
    "paging": {
        "page": 1,
        "page_size": 50,
        "total_count": 1
    }
}

Find By ID
Relationships

This endpoint supports the following additional relationships. Refer to our User Guide for usage.

This endpoint supports additional relationships. You can ask for them using the relationship query parameter. Multiple relationships can be supplied repeating the relationship query parameter.
Value 	Description
reporting 	Includes reporting informations
labels 	Includes a list of labels associated to the advertiser
demand_partner 	Includes the Everxchange information associated to the advertiser
billing 	Includes the billing information associated to the advertiser
integrations 	Includes the billing information associated to the advertiser
api 	Includes the advertiser’s API keys
GET /v1/networks/advertisers/:advertiserId
Path Parameters
Parameter 	Description
advertiserId 	The ID of the advertiser you want to fetch
Request Example
Find (Advanced)
POST /v1/networks/advertiserstable
Paging

This endpoint supports paging. Refer to our User Guide for usage.
Body Params
Request Example
Create
POST /v1/networks/advertisers
Body Params
Payload Example
Update
PUT /v1/networks/advertisers/:advertiserId

You must specify all the fields, not only the ones you wish to update. Omitting a field that is not marked as required will result in its default value being used or in the field getting deleted entirely.

The Bulk Edit endpoint documented below allows you to update only certain fields on an advertiser, which is much less error prone.
Path Parameters
Parameter 	Description
advertiserId 	The ID of the advertiser you want to update
Body Params
Payload Example
Bulk Edit
PATCH /v1/networks/patch/advertiser/apply

This endpoint allows you to update selected fields of one or multiple advertisers at the same time. It does not require the entire advertiser object to be passed in the payload. Only the properties that need to be changed must be supplied.
Request Body
Request Examples
Patch Preview
POST /v1/networks/patch/advertiser/submit

This endpoint works exactly the same way the Bulk Edit endpoint documented above does, with the important difference that it does not actually change anything. Rather the endpoint will return of a preview of the changes and will flag any errors.
Body Params
Response
changes object array
View Object Details
resource_errors object array

If some of the advertisers that are part of the patch are not in a valid state prior to the patch, the patch will not be attempted and instead a list of the advertiser errors will be returned here.
View Object Details
Patchable Fields

The fields below are to be used in the Bulk Edit and Patch Preview endpoints documented above.
Fields
advertiser_status string

Status of the advertiser. Can be one of the following values: active, inactive or suspended.
account_manager_id int

The employee ID of the advertiser’s account manager.
sales_manager_id int

The employee ID of the advertiser’s sales manager.
labels string array

The list of labels associated with the advertiser.
advertiser_name string

The name of the advertiser
currency_id string

The advertiser’s default currency. Can be found using the metadata API.
attribution_method string

Can be one of the following values: first_touch or last_touch.
attribution_priority string

Determines whether click attribution takes precedence over coupon code attribution for these advertisers. Can be one of the following values: click or coupon_code.
email_attribution_method string

Can be one of the following values: first_affiliate_attribution or last_affiliate_attribution.
internal_note string

Internal notes for the advertiser.
verification_token string

If enabled, the verification token will be applied to all incoming postbacks for that advertiser. If the verification_token field doesn’t match the token, the conversions will be set to rejected. We support up to 50 characters for the token.
variables_affiliate_id boolean

Whether or not you want to expose the affiliate ID in the advertiser UI.
variables_affiliate boolean

Whether or not you want to expose the affiliate variables in the advertiser UI. This will expose both the affiliate name and id.
variables_sub1 boolean

Whether or not you want to expose the Sub1 variable in the advertiser UI.
variables_sub2 boolean

Whether or not you want to expose the Sub2 variable in the advertiser UI.
variables_sub3 boolean

Whether or not you want to expose the Sub3 variable in the advertiser UI.
variables_sub4 boolean

Whether or not you want to expose the Sub4 variable in the advertiser UI.
variables_sub5 boolean

Whether or not you want to expose the Sub5 variable in the advertiser UI.
variables_source_id boolean

Whether or not you want to expose the Source ID variable in the advertiser UI.
billing_tax_details string

The advertiser’s tax id.
billing_frequency string

The advertiser’s invoicing frequency. Can be one of the following values: weekly, bimonthly, monthly, two_months, quarterly, manual or other.
billing_frequency_weekly object

The advertiser’s billing weekly frequency details. Required when billing_frequency is set to weekly.
View Object Details
billing_frequency_bimonthly object

The advertiser’s billing bimonthly frequency details. Required when billing_frequency is set to bimonthly.
View Object Details
billing_frequency_monthly object

The advertiser’s billing monthly frequency details. Required when billing_frequency is set to monthly.
View Object Details
billing_frequency_two_months object

The advertiser’s billing two months frequency details. Required when billing_frequency is set to two_months.
View Object Details
billing_frequency_quarterly object

The advertiser’s billing quarterly frequency details. Required when billing_frequency is set to quarterly.
View Object Details
billing_auto_invoicing_auto_creation boolean

Configures automatic invoice creations for the advertiser. Defaults to false.
billing_auto_invoicing_creation_amount_threshold double

Configures the minimal amount required for an invoice to be generated. Sums below the threshold are rolled over to the next billing period. Defaults to 0, which is none.
billing_auto_invoicing_auto_invoice_start_date string

Configures automatic invoice creation start date. Dates are formatted YYYY-mm-dd. Required if is_invoice_creation_auto is set to true.
billing_auto_invoicing_generation_days_delay int

Configures how many days to wait for invoice generation after the specified billing period. Defaults to 0.
billing_invoice_setting_terms_days int

Configures the number of days that will be used as the payment term on generated invoices. Defaults to 0.
billing_invoice_setting_hide_from_advertiser_ boolean

Configures whether invoices are hidden from the advertiser by default. Defaults to false.
offer_id_macro string

The string used for the offer id macro. This determines your preferred link format for receiving the Offer ID when using a Direct Linking Setup. Leaving this field blank will fallback to oid.
affiliate_id_macro string

The string used for the affiliate id macro. This determines your preferred link format for receiving the Partner’s ID when using a Direct Linking Setup. Leaving this field blank will fallback to affid.

Affiliates
Operations for affiliates
Fetch Affiliates
POST /v1/networks/affiliatestable

This is the main endpoint to extract a list of affiliates from the API. It’s possible to filter the affiliates returned by this endpoint using 2 different methods (which can be combined) :

    Search Terms : equivalent to a text search (e.g. find affiliates with a name that contains the word “John”)
    Query Filters : structured filters on predefined fields (e.g. find affiliates that are managed by Affiliate Manager John Doe)

Paging

This endpoint supports paging. Refer to our User Guide for usage.
Body Params
Relationships

This endpoint supports the following additional relationships. Refer to our User Guide for usage.
Value 	Description
signup 	Includes the affiliate’s sign up information
users 	Includes the users that exist for the affiliate
Examples
Find By ID
GET /v1/networks/affiliates/:affiliateId
Relationships

This endpoint supports the following additional relationships. Refer to our User Guide for usage.

This endpoint supports additional relationships. You can ask for them using the relationship query parameter. Multiple relationships can be supplied repeating the relationship query parameter.
Value 	Description
reporting 	Includes reporting informations
billing 	Includes billing and invoicing informations
coupon_codes 	Includes a list of the affiliate’s coupon codes
users 	Includes the list of affiliate users
audits 	Includes the revision history of changes made to the affiliate
visibility 	Includes lists of visible, hidden and rejected offers
signup 	Includes the affiliate’s signup info
api 	Includes the affiliate’s API keys
traffic_source 	Includes the affiliate’s traffic sources
referral_link 	Includes the affiliate’s referral link
referrer 	Include the affiliate’s referer, if any
referral 	Includes the affiliate’s referral info
supply_partner 	Includes the affiliate’s EverXchange settings
Path Parameters
Parameter 	Description
affiliateId 	The ID of the affiliate you want to fetch
Request Example
Create
POST /v1/networks/affiliates
Body Params
Payload Example
Update
PUT /v1/networks/affiliates/:affiliateId

You must specify all the fields, not only the ones you wish to update. Omitting a field that is not marked as required will result in its default value being used or in the field getting deleted entirely.

The Bulk Edit endpoint documented below allows you to update only certain fields on an affiliate, which is much less error prone.
Path Parameters
Parameter 	Description
affiliateId 	The ID of the affiliate you want to update
Body Params
Payload Example
Bulk Edit
PATCH /v1/networks/patch/affiliates/apply

This endpoint allows you to update selected fields of one or multiple affiliates at the same time. It does not require the entire affiliate object to be passed in the payload. Only the properties that need to be changed must be supplied.
Request Body
Request Examples
Patch Preview
POST /v1/networks/patch/affiliates/submit

This endpoint works exactly the same way the Bulk Edit endpoint documented above does, with the important difference that it does not actually change anything. Rather, the endpoint will return of a preview of the changes and will flag any errors.
Body Params
Response
changes object array
View Object Details
resource_errors object array

If some of the affiliates that are part of the patch are not in a valid state prior to the patch, the patch will not be attempted and instead a list of the affiliates errors will be returned here.
View Object Details
Patchable Fields

The fields below are to be used in the Bulk Edit and Patch Preview endpoints documented above.
Fields
Pending Affiliates
PATCH /v1/networks/pending/affiliates

This endpoint is for changing the status of a pending affiliate to either a active or inactive/rejected state. Multiple pending affiliate’s status’s can be changed at once and not all parameters need to be present in the call be made.
Request Body
Body Param
network_affiliate_ids int array

IDs of the affiliates to be patched.
account_status

The status the affiliates will be updated to. Can be one of the following values: active, inactive or suspended.
affiliate_manager_id

The employee id of the affiliates account manager.
network_traffic_source_id

Traffic source if any that should be associated with the affiliates being activated
Body Example

{
    "network_affiliate_ids": [
        3,
        12
    ],
      "account_status": "active",
      "affiliate_manager_id": 1,
      "network_traffic_source_id": 0
}

Request Examples
cURL

curl --request PATCH 'https://api.eflow.team/v1/networks/pending/affiliates' \
--header 'X-Eflow-API-Key: <INSERT API KEY>' \
--header 'Content-Type: application/json' \
--data '<INSERT BODY HERE>'

Example 1 : rejecting/suspending multiple pending affiliates at the same time :

{
    "network_affiliate_ids": [
        3,
        12
    ],  
    "account_status": "inactive",
    "affiliate_manager_id": 1
}

Example 2 : approving a single affiliate

{
    "network_affiliate_ids":
    [
        24
    ],
    "account_status": "active",
    "affiliate_manager_id": 10,
    "network_traffic_source_id": 0
}

Response

{
  "result": true
}

Offers
Operations for offers
Fetch Offers
POST /v1/networks/offerstable

This is the main endpoint to extract a list of offers from the API. It’s possible to filter the offers returned by this endpoint using 2 different methods (which can be combined) :

    Search Terms : equivalent to a text search (e.g. find offers with a name that contains the word “phone”)
    Query Filters : structured filters on predefined fields (e.g. find offers that target the Android platform)

Please note that the destination_url in the response is the offer’s default landing page URL
Paging

This endpoint supports paging. Refer to our User Guide for usage.
Body Params
Relationships

This endpoint supports the following additional relationships. Refer to our User Guide for usage.
Value 	Description
visibility 	Includes the offer’s visibility information
ruleset 	Includes the offer’s targeting ruleset
tracking_domain 	Includes the offer’s tracking domain
urls 	Includes the offer URLs
affiliate_tier 	Includes which affiliate tiers are involved
account_manager 	Includes the offer’s account manager’s information
sales_manager 	Includes the offer’s sale manager’s information
Examples
Response
Find By ID
GET /v1/networks/offers/:offerId

This endpoint allows you fetch the details of a single offer.

Please note that the destination_url is the offer’s default landing page URL
Path Parameters
Parameter 	Description
offerId 	The ID of the offer you want to fetch
Relationships

This endpoint supports the following additional relationships. Refer to our User Guide for usage.
Value 	Description
advertiser 	Includes the offer’s advertiser
offer_group 	Includes the offer’s offer group, if applicable
visibility 	Includes the offer’s visibility information
payout_revenue 	Includes the offer’s payout revenue information
custom_cap_settings 	Includes the offer’s cap settings
custom_scrub_rate_settings 	Includes the offer’s throttle rate settings
custom_payout_revenue_settings 	Includes the offer’s revenue & payout settings
custom_creative_settings 	Includes the offer’s creative settings
redirects 	Includes the offer’s redirects information
traffic_filters 	Includes the traffic filters information
targeting 	Includes the offer’s targeting information
files 	Includes the offer’s files information
audits 	Includes the offer’s audits information
source_name 	Includes the source name information
urls 	Includes the urls information
integrations 	Includes the offer’s integrations information
campaigns 	Includes the offer’s campaigns information
advertiser_global_events 	Includes the advertiser’s global events information
offer_email 	Includes the offer’s email information
offer_email_optout 	Includes the offer’s email opt-out information
reporting 	Includes the offer’s reporting for today
Request Example
Create
POST /v1/networks/offers

While it is possible to create offers using this endpoint, it’s important to note that because of the nature of the offer object in Everflow, the payload that must be passed here is extremely complex. We unfortunately cannot possibly provide examples for all the configurations possible.

It is often much simpler to create a “template” offer manually in your Everflow account and then make use of the Copy endpoint and the Bulk Edit endpoint to change the properties that need to be updated.
Body Params
Response Example
Copy
GET /v1/networks/offers/:offerId/copy

This endpoint allows you to make a complete copy of an offer that already exists. The different options give you control over which additional settings should be copied along with the offer.

When successful, this endpoint returns the new offer copy.
Path Parameters
Parameter 	Description
offerId 	The ID of the offer you want to copy
Query String Parameters
Parameter 	Description
is_copy_custom_settings 	Determines whether custom settings (custom payout & revenue, caps, throttle rate and landing page settings) will be copied along with the offer
is_copy_creatives 	Determines whether the creatives will be copied along with the offer. Custom creatives will also be copied along when this option is set to true
is_copy_visibility 	Determines whether affiliate visibility is copied along with the offer
is_copy_additional_urls 	Determines whether Offer URLs are copied along with the offer
is_copy_forwarding_rules 	Determines whether forwarding rules are copied along with the offer
name 	Determines the name of the copied offer. Note that this must be URL encoded since it is passed in the query string (eg Copied%20Offer%20--%20%5BCPA%5D%20Web%20Sale! for the name Copied Offer -- [CPA] Web Sale!).
If the name parameter is omitted entirely, the copied offer will be name <Old Offer Name> (Copy)
Request Examples
Update
PUT /v1/networks/offers/:offerId

While it is possible to updates offers using this endpoint, it’s important to note that because of the nature of the offer object in Everflow, the payload that must be passed here is extremely complex. Updating an offer via this endpoint requires you to pass the entire object.

You must specify all the fields, not only the ones you wish to update. Omitting a field that is not marked as required will result in its default value being used or in the field getting deleted entirely.

The Bulk Edit endpoint documented below allows you to update only certain fields on an offer, which is much less error prone.
Path Parameters
Parameter 	Description
offerId 	The ID of the offer you want to update
Body Params
Response Example
Bulk Edit
PATCH /v1/networks/patch/offers/apply

This endpoint allows you to update selected fields of one or multiple offers at the same time. It does not require the entire offer object to be passed in the payload. Only the properties that need to be changed must be supplied.

Note that certain properties must be updated together. For example updating offers to set the is_caps_enabled to true without specifiying cap values would result in an invalid request.

This endpoint cannot be used to manage the partner visibility over offers. See here to the visibility documentation.
Request Body
Request Examples
Patch Preview
POST /v1/networks/patch/offers/submit

This endpoint works exactly the same way the Bulk Edit endpoint documented above does, with the important difference that it does not actually change anything. Rather the endpoint will return of a preview of the changes and will flag any errors.
Body Params
Response
changes object array
View Object Details
resource_errors object array

If some of the offers that are part of the patch are not in a valid state prior to the patch, the patch will not be attempted and instead a list of the offer errors will be returned here.
View Object Details
Patchable Fields

The fields below are to be used in the Bulk Edit and Patch Preview endpoints documented above.
Fields
offer_status string

Status of the offer. Can be one of the following values: active, paused, pending or deleted.
network_advertiser_id int

ID of the advertiser
network_offer_group_id int

ID of the offer group associated with the offer
network_category_id int

ID of the category associated with the offer
currency_id string

Currency used to compute payouts costs and revenues of the offer.
offer_name string

Displayed name of the offer.
labels string array

Labels are used for organizing offers by private internal keywords.
app_identifier string

Bundle ID for iOS / Android Apps
internal_notes string

Notes on the offer for network employees. Not displayed to affiliates and advertisers.
project_id string

ID for the advertiser campaign or an Insertion Order.
channels object array
View Object Details
date_live_until string

Date until when the offer can be run. Events occurring past the end of the day at the timezone of the network will be rejected.
html_description string

Description of the offer for the affiliates. HTML code is accepted.
is_offer_description_plaintext boolean

Whether the description of the offer should be interpreted as plain text.
destination_url string

URL of the final landing page associated with the offer, including additional macros if applicable. Referred to as the offer’s default landing page URL in the UI.
preview_url string

Preview URL associated with the offer
server_side_url string

URL of the page that will be called from the server side of Everflow, including additional macros if applicable.
view_through_destination_url string

URL of the final landing page associated with the offer when redirected from an impression (including additional macros if applicable). Only relevant if is_view_through_enabled is true.
invoca_enabled boolean

Whether the Invoca integration is enabled for the offer
payout_revenue_name string

Name for the initial conversion action.
revenue object
View Object Details
payout object
View Object Details
is_must_approve_conversion boolean

Enabling will hide all conversions from partners and won’t fire their postbacks. These conversions may be viewed under Reporting > Conversions and Status : ‘Pending’.
is_allow_duplicate_conversion boolean

Enabling allows partners to deliver multiple ‘Approved’ conversions from the same Transaction ID. If disabled, those conversions are rejected and not payable to partners.
is_postback_disabled boolean

Enabling will prevent the partners postback from being fired on the successful initial conversion. Enabling this feature is useful whenever the base conversion is not tied to a payable action.
network_tracking_domain_id int

ID of the tracking domain hit by clicks belonging to the offer.
conversion_method string

Method used by the Advertiser to fire tracking data to Everflow. Can be one of the following values: http_image_pixel, https_image_pixel, server_postback, cookie_based, http_iframe_pixel, https_iframe_pixel or javascript.
is_use_secure_link boolean

Whether tracking links use the more secure https:// instead of http://. Please validate with your account manager that SSL is enabled before using the offer level setting.
is_allow_deep_link boolean

Whether affiliates can send their traffic to target URLs by adding &url=[target URL] to their tracking links, instead of the offer’s destination URL.
is_use_direct_linking boolean

Whether the offer is using Direct Linking.
is_caps_enabled boolean

Whether caps are enabled. When false, voids all types of caps and custom caps.
daily_conversion_cap int

Limit to the number of unique conversions in one day.
weekly_conversion_cap int

Limit to the number of unique conversions in one week (Monday midnight to Sunday 23h59:59)
monthly_conversion_cap int

Limit to the number of unique conversions in one month.
global_conversion_cap int

Limit to the total number of unique conversion at the offer level.
daily_payout_cap int

Limit to the affiliate’s payout for one day.
weekly_payout_cap int

Limit to the affiliate’s payout for a week (Monday midnight to Sunday 23h59:59)
monthly_payout_cap int

Limit to the affiliate’s payout for one month.
global_payout_cap int

Limit to the affiliate’s total payout at the offer level.
daily_revenue_cap int

Limit to the network’s revenue for one day.
weekly_revenue_cap int

Limit to the network’s revenue for a week (Monday midnight to Sunday 23h59:59)
monthly_revenue_cap int

Limit to the network’s revenue for one month.
global_revenue_cap int

Limit to the network’s total revenue at the offer level.
daily_click_cap int

Limit to the number of unique clicks in one day.
weekly_click_cap int

Limit to the number of unique clicks in a week (Monday midnight to Sunday 23h59:59).
monthly_click_cap int

Limit to the number of unique clicks in one month.
global_click_cap int

Limit to the total number of unique clicks at the offer level.
visibility string

Setting for the offer’s visibility for affiliates. Can be one of the following values: public, require_approval or private. [Learn More]
is_using_explicit_terms_and_conditions boolean

Whether the offer is using specific Terms and Conditions. When false, defaults to the network’s general Terms and Conditions.
is_force_terms_and_conditions boolean

Whether the affiliates are required to accept the offer’s specific Terms and Conditions.
terms_and_conditions string

Text listing the specific Terms and Conditions of the offer. Required only if is_using_explicit_terms_and_conditions is true.
is_whitelist_check_enabled boolean

Whether a check is made to ensure conversion postback origin from the advertiser. [Learn More]
session_definition string

Method used for determining whether a click is unique. Can be one of the following values: cookie, ip, ip_user_agent, google_ad_id or idfa. [Learn More]
session_duration string

Duration (in hours) of the active session used to match a click to a conversion.
is_duplicate_filter_enabled boolean

Whether duplicate clicks are filtered and acted upon, according to the offer’s duplicate_filter_targeting_action.
duplicate_filter_targeting_action string

Action that should be taken when a duplicate click is encountered. Ignored if is_duplicate_filter_enabled is false. Can be either block or fail_traffic.
redirect_mode string

Setting used to obscure referrer URLs from advertisers. Can be one of the following values: standard, single_meta_refresh or double_meta_refresh. Not recommended, this will cause click drop-off.
requirement_kpis object array
View Object Details
requirement_tracking_parameters object array
View Object Details
is_block_already_converted boolean

Whether clicks from users who have already converted on this offer are acted upon according to the offer’s already_converted_action.
already_converted_action string

Action that should be taken when a click from a user who has already converted on this offer is encountered. Ignored if is_block_already_converted is false. Can be either block or fail_traffic.
is_use_scrub_rate boolean

Whether a predefined percentage of conversion get arbitrarily rejected. Required only if is_must_approve_conversion is true. This mechanism prevents that an excessive number of conversion gets approved.
scrub_rate_status string

Status to apply to conversions affected by throttling. Required only if is_use_scrub_rate is true. Can be either rejected or pending.
scrub_rate_percentage int

Percentage of conversions to be automatically throttled. Required only if is_use_scrub_rate is true.
is_session_tracking_enabled boolean

Whether affiliate’s conversions and payouts get automatically blocked based on a minimum and maximum time from the click to the associated conversion.
session_tracking_lifespan_hour int

Maximum interval of time between the click event and a valid conversion or event. Required only if is_session_tracking_enabled is true.
session_tracking_minimum_lifespan_second int

Minimum interval of time between the click event and a valid conversion or event. Required only if is_session_tracking_enabled is true.
is_view_through_enabled boolean

Whether conversions can be generated from impressions (as opposed to being generated from clicks only).
is_view_through_session_tracking_enabled boolean

Whether affiliate’s conversions and payouts get automatically blocked based on a minimum and maximum time from the impression to the associated conversion. Only relevant if is_view_through_enabled is true.
view_through_session_tracking_lifespan_minute int

Maximum interval of time between the impression event and a valid conversion or event. Required only if is_session_tracking_enabled is true.
view_through_session_tracking_minimal_lifespan_second int

Minimum interval of time between the impression event and a valid conversion or event. Required only if is_session_tracking_enabled is true.
twentyfour_metrics_network_integration_twentyfour_metrics_tracker_id int

ID of the tracker.
forensiq_is_forensiq_click_threshold_enabled boolean

Whether the threshold for clicks is enabled.
forensiq_click_threshold int

Threshold for clicks above which the action will occur. One of click_threshold or conversion_threshold must be above 0.
forensiq_action string

Action to take for clicks that fail to meet the click threshold. Can be one of the following values: block or fail_traffic.
forensiq_is_forensiq_conversion_threshold_enabled boolean

Whether the threshold for conversions is enabled.
forensiq_conversion_threshold int

Threshold for conversions above which the conversion_status will be applied. One of click_threshold or conversion_threshold must be above 0.
forensiq_conversion_status string

Status to apply to conversions that fail to meet the conversion threshold. Can be one of the following values: pending or rejected.
anura_enabled boolean

Whether the anura integration is enabled for the offer.
ip_quality_score_enabled boolean

Whether the scrubkit integration is enabled for the offer.
ip_quality_score_min_fraud_score string

Threshold for traffic above which the ip_quality_score_action will be applied.
ip_quality_score_min_fraud_score_mobile string

Threshold for mobile traffic above which the ip_quality_score_action will be applied.
ip_quality_score_action string

Action to take for traffic that fail to meet the threshold. Can be one of the following values: block or fail_traffic.
scrubkit_enabled boolean

Whether the scrubkit integration is enabled for the offer.
ruleset_platforms object array

Platforms are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_device_types object array

Device types are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
brands object array

Brands are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_browsers object array

Browsers are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_os_versions object array

OS versions are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_languages object array

Browser languages are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_countries object array

Countries are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_postal_codes object array

ZIP / Postal Codes are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_regions object array

Regions are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_cities object array

Cities are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_dmas object array

DMAs are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_mobile_carriers object array

Mobile Carriers are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_isps object array

ISPs are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_connection_types object array

Connection types are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_ips object array

IPs are used to narrow down the targeting of your offers, campaigns, custom settings, etc.
View Object Details
ruleset_is_block_proxy boolean

Whether or not traffic from well known proxy will be blocked.
traffic_filters string
ruleset_is_use_day_parting boolean

Whether day parting is enabled.
ruleset_day_parting_apply_to string

Setting determining the timezone the day parting is applied to. Can be one of the following values: user_timezone or selected_timezone. Only required if is_use_day_parting is true.
ruleset_day_parting_timezone_id int

ID of the day parting timezone. Only required if is_use_day_parting is true and if day_parting_apply_to has the value selected_timezone.
ruleset_days_parting object array

The day parting objects. Only required if is_use_day_parting is true.
View Object Details
is_fail_traffic_enabled boolean

Whether the invalid clicks will be redirected to another offer.
redirect_internal_routing_type string

Redirect mechanism that determines how the fail traffic is distributed between listed offers. Can be one of the following values: priority, weight, priority_global or weight_global. Only relevant if is_fail_traffic_enabled is true.
email_is_enabled boolean

Whether approved Subject and From lines for emails are used.
email_subject_lines string

Approved Subject lines for emails. Only relevant if is_enabled is true.
email_from_lines string

Approved From lines for emails. Only relevant if is_enabled is true.
email_optout_is_enabled boolean

Whether the suppression file url and unsubscribe link for emails are used.
email_optout_suppression_file_link string

URL of the link to the suppression files.
email_optout_unsub_link string

URL of the link to unsubscribe.
ezepo_enabled boolean

Whether the ezepo integration is enabled for the offer.
optizmo_optoutlist_id string

ID of the Optizmo Optout List.
Export
POST /v1/networks/export/offers
Body Params
format string

Format of the export. Can be one of the following values: csv or json.
fields string array

Offer fields to be included in the file, from the following values:

network_offer_id, name, category, network_advertiser_id, network_offer_group_id, internal_notes, destination_url, server_side_url, is_view_through_enabled, view_through_destination_url, preview_url, offer_status, currency_id, project_id, date_live_until, is_using_explicit_terms_and_conditions, terms_and_conditions, is_caps_enabled, daily_conversion_cap, weekly_conversion_cap, monthly_conversion_cap, global_conversion_cap, daily_payout_cap, weekly_payout_cap, monthly_payout_cap, global_payout_cap, daily_revenue_cap, weekly_revenue_cap, monthly_revenue_cap, global_revenue_cap, daily_click_cap, weekly_click_cap, monthly_click_cap, global_click_cap, redirect_mode, is_must_approve_conversion, is_allow_duplicate_conversion, is_duplicate_filter_enabled, duplicate_filter_targeting_action, network_tracking_domain_id, is_use_secure_link, is_allow_deep_link, is_session_tracking_enabled, session_tracking_lifespan_hour, is_view_through_session_tracking_enabled, view_through_session_tracking_lifespan_minute, is_fail_traffic_enabled, redirect_routing_method, redirect_internal_routing_type, visibility, time_created, time_saved, conversion_method, is_whitelist_check_enabled, is_use_scrub_rate, scrub_rate_status, scrub_rate_percentage, session_definition, session_duration, app_identifier, entry_name, payout_type, payout_amount, payout_percentage, revenue_type, revenue_amount, revenue_percentage, network_advertiser_name, network_advertiser_account_manager, network_advertiser_sales_manager, suppression_file_url, unsubscribe_url, countries, network_tracking_domain_url, category_name, channels.

If omitted, will return all fields.
query object

