import {
    createSelector,
    createEntityAdapter,
} from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';

const notesAdapter = createEntityAdapter();
const initialState = notesAdapter.getInitialState();

export const notesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getNotes: builder.query({
            query: () => '/notes',
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError;
            },
            keepUnusedDataFor: 5,
            transformResponse: responseData => {
                const loadedNotes = responseData.map(note => {
                    note.id = note._id;
                    return note;
                });
                return notesAdapter.setAll(initialState, loadedNotes);
            },
            providedTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        {
                            type: 'Note', id: 'LIST'
                        },
                        ...result.ids.map(id => ({ type: 'Note', id }))
                    ]
                } else return [{ type: 'Note', id: 'LIST' }];
            }
        })
    })
});

export const {
    useGetNotesQuery,
} = notesApiSlice;

export const selectNotesResult = notesApiSlice.endpoints.getNotes.select();

//creates memoized selector
export const selectAllNotes = createSelector(
    selectNotesResult,
    notesResult => notesResult.data //normalized state object with ids & entities
)

// getSelectors creates these selectors and we rename them with aliases
//using destructuring
export const {
    selectAll: selectAllNotes,
    selectById: selectNoteById,
    selectIds: selectNoteIds
} = notesAdapter.getSelectors(state => selectNotesData(state) ?? initialState);

