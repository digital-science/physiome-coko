import FormFieldDate from './fields/form-field-date';
import FormFieldTextArea from './fields/form-field-textarea';
import FormFieldText from './fields/form-field-text';
import FormFieldFileUploader from './fields/form-field-file-uploader';
import FormFieldButton from './fields/form-field-button';
import FormFieldCheckbox from './fields/form-field-check-box';
import FormFieldSelect from './fields/form-field-select';

import FormFieldInlineTask from './fields/form-field-inline-task';

import FormFieldStaticText from './fields/form-field-static-text';
import FormFieldFilesListing from './fields/form-field-files-listing';

import FormFieldGroup from './fields/form-field-group';

import FormFieldAuthors from './fields/form-field-authors';

import FormFieldFigshareEmbed from './fields/form-field-figshare-embed';


// Lookup registry for form fields.
const FormFieldRegistry = {
    'Date' : FormFieldDate,
    'TextArea' : FormFieldTextArea,
    'Text' : FormFieldText,
    'Button' : FormFieldButton,
    'Checkbox' : FormFieldCheckbox,
    'SelectValue' : FormFieldSelect,

    'FileUploader': FormFieldFileUploader,
    'AuthorsEditor' : FormFieldAuthors,

    'InlineTaskForm' : FormFieldInlineTask,

    // Static details form fields
    'StaticText' : FormFieldStaticText,
    'FilesListing': FormFieldFilesListing,

    'Group': FormFieldGroup,

    'FishareArticleEmbed' : FormFieldFigshareEmbed
};

export default FormFieldRegistry;

export function registerFormFieldType(name, component) {
    FormFieldRegistry[name] = component;
}