import { transliterate } from 'transliteration';

export const generateSlug = (title: string): string => {
	let slug = transliterate(title)
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');

	const dateNow = new Date().getTime();

	slug = `${dateNow}-${slug}`;

	return slug;
};
