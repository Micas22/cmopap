# TODO: Add Feature to ShelterMap for Creating New Shelters

## Steps to Complete

- [x] Add state variables for dialog open/close and new shelter form data in ShelterMap.tsx
- [x] Add "Add Shelter" button to the map UI
- [x] Import and add Dialog component for the form
- [x] Implement map click handler to capture latitude and longitude
- [x] Create form in dialog with fields: name, owner, contact, num_animais
- [x] Handle form submission to POST to /api/admin/colonias
- [x] Refresh shelters list after successful creation
- [x] Close dialog and reset form after submission
- [x] Test the feature by adding a new shelter

## Feature Implementation Complete

The ShelterMap component now includes a feature to add new shelters:

- **Add Shelter Button**: Located in the filter panel, opens a dialog for creating new shelters
- **Interactive Map Selection**: Users can click on the map to set the latitude and longitude for the new shelter
- **Form Fields**: Includes name, responsible person, contact, number of animals, and location
- **API Integration**: Submits data to `/api/admin/colonias` POST endpoint
- **Real-time Updates**: New shelters appear immediately on the map after creation
- **Validation**: Ensures all required fields are filled before submission

The feature allows users to pinpoint a location on the map and create a new shelter through the colonias route as requested.
