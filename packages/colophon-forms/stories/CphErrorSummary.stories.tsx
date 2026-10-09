import type { Meta, StoryObj } from "@storybook/react";

import { CphErrorSummary, CphField, CphForm, required, toValidator } from "../src";

const meta: Meta<typeof CphErrorSummary> = {
  title: "Colophon/Forms/CphErrorSummary",
  component: CphErrorSummary,
  args: { errors: [] },
};
export default meta;
type S = StoryObj<typeof CphErrorSummary>;

export const NoErrors: S = { args: { errors: [] } };

export const WithErrors: S = {
  render: (args) => (
    <>
      <CphErrorSummary {...args} />
      <CphField id="title" label="Title" />
      <CphField id="email" label="Email" />
      <CphField id="body" label="Description" />
    </>
  ),
  args: {
    errors: [
      { fieldId: "title", message: "Title is required." },
      { fieldId: "email", message: "Enter a valid email address." },
      { fieldId: "body", message: "Description is too short." },
    ],
  },
};

export const WithMappedField: S = {
  render: () => (
    <CphForm
      defaultValues={{ title: "" }}
      getFieldId={(name) => `${name}-field`}
      onSubmit={() => undefined}
    >
      {(form) => (
        <form.Field
          name="title"
          validators={{ onSubmit: toValidator(required("Title is required.")) }}
        >
          {(field) => (
            <CphField
              id="title-field"
              label="Title"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      )}
    </CphForm>
  ),
};
