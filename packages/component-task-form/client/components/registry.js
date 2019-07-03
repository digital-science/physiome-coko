import FormFieldDate from './fields/form-field-date';
import FormFieldTextArea from './fields/form-field-textarea';
import FormFieldText from './fields/form-field-text';
import FormFieldFileUploader from './fields/form-field-file-uploader';
import FormFieldButton from './fields/form-field-button';
import FormFieldCheckbox from './fields/form-field-check-box';
import FormFieldHeroCheckbox from './fields/form-field-hero-checkbox';
import FormFieldSelect from './fields/form-field-select';

import FormFieldInlineTask from './fields/form-field-inline-task';
import FormFieldViewerEditorLayout from './fields/form-field-viewer-editor-layout';

import FormFieldStaticText from './fields/form-field-static-text';
import FormFieldFilesListing from './fields/form-field-files-listing';

import FormFieldGroup from './fields/form-field-group';

import FormFieldAuthorsEditor, { FormFieldAuthorsListing } from './fields/form-field-authors';
import FormFieldFundingEditor, { FormFieldFundingListing } from './fields/form-field-funding';
import FormFieldArticleCitation from './fields/form-field-article-citation';
import FormFieldArticleCitationListEditor from './fields/form-field-article-citation-list';
import FormFieldKeywords, { FormFieldKeywordsListing } from './fields/form-field-keywords';

import FormFieldFigshareEmbed from './fields/form-field-figshare-embed';


// Lookup registry for form fields.
const FormFieldRegistry = {

    'Date' : FormFieldDate,
    'TextArea' : FormFieldTextArea,
    'Text' : FormFieldText,
    'Button' : FormFieldButton,
    'Checkbox' : FormFieldCheckbox,
    'HeroCheckbox' : FormFieldHeroCheckbox,
    'SelectValue' : FormFieldSelect,

    'AuthorsEditor' : FormFieldAuthorsEditor,
    'AuthorsListing' : FormFieldAuthorsListing,

    'FileUploader': FormFieldFileUploader,
    'FilesListing': FormFieldFilesListing,

    'FundingEditor' : FormFieldFundingEditor,
    'FundingListing' : FormFieldFundingListing,

    'ArticleCitation' : FormFieldArticleCitation,
    'ArticleCitationListEditor' : FormFieldArticleCitationListEditor,

    'KeywordsEditor' : FormFieldKeywords,
    'KeywordsListing' : FormFieldKeywordsListing,

    'InlineTaskForm' : FormFieldInlineTask,
    'ViewerEditorLayout' : FormFieldViewerEditorLayout,

    // Static details form fields
    'StaticText' : FormFieldStaticText,

    'Group': FormFieldGroup,

    'FishareArticleEmbed' : FormFieldFigshareEmbed
};

export default FormFieldRegistry;

export function registerFormFieldType(name, component) {
    FormFieldRegistry[name] = component;
}