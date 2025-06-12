export const artistSchema = {
  name: { required: true }
};

export const validateArtist = (data) => ({
  isValid: true,
  errors: {}
});

export default artistSchema;

