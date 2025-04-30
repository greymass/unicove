export interface Article {
	title: string;
	date: string;
	thumbnail: string;
	description: string;
	slug: string;
}

export interface StoryBlokArticle {
	content: {
		title: string;
		date: string;
		seo: {
			image: {
				filename: string;
			};
			metaDescription: string;
		}[];
	};
	full_slug: string;
}
