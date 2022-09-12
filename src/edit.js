import { useState, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	ColorPalette,
	InspectorControls,
} from "@wordpress/block-editor";
import { Spinner } from "@wordpress/components";
import "./editor.scss";

import { __experimentalHeading as Heading } from "@wordpress/components";

export default function Edit({ attributes, setAttributes }) {
	const [showColorPicker, setShowColorPicker] = useState([false, false, false]);
	const [allCat, setAllCat] = useState(Array());
	const [isLoading, setIsLoading] = useState(true);

	const [isError, setError] = useState(false);
	const [noFeatured, setNoFeatured] = useState(false);
	const [reload, setReload] = useState(false);

	const [previewImg, setPreviewImg] = useState();
	const [previewHeadline, setPreviewHeadline] = useState();
	const [previewText, setPreviewText] = useState();
	const [postDate, setPostDate] = useState();

	const [posts, setPosts] = useState([]);

	useEffect(() => {
		// fetch all categories
		fetch(`${attributes.apiUrl}wp/v2/categories?per_page=100`)
			.then((res) => res.json())
			.then(
				(result) => {
					setError(false);
					if (reload) {
						setAttributes({ selectedCategory: 0 });
						setReload(false);
					}
					const tempCatArray = new Array();
					result.forEach((element) => {
						const el = {};
						el.id = element.id;
						el.name = element.name;
						tempCatArray.push(el);
					});
					setAllCat(tempCatArray);
				},
				(error) => {
					setError(true);
					console.log(error);
				}
			);
	}, [attributes.apiUrl]);

	// update the preview on changes and save data
	useEffect(async () => {
		await getData();
	}, [attributes.featured, attributes.selectedCategory, attributes.apiUrl]);

	// update the preview on changes and save data
	useEffect(() => {
		if (posts.length > 0) {
			console.log(posts);
			// save posts
			setAttributes({ posts: posts.slice(0, attributes.postsCount) });

			// set preview data
			setPreviewImg(posts[0].img);
			setPreviewHeadline(posts[0].title);
			setPreviewText(posts[0].excerpt);
			setPostDate(posts[0].date);
		}
	}, [posts.length, attributes.postsCount]);

	async function getData() {
		setIsLoading(true);
		// fetch latest post for preview, take 12 results as it's maximum slide count
		let fetchPostUrl = ``;
		if (attributes.selectedCategory != 0) {
			fetchPostUrl = `${attributes.apiUrl}wp/v2/posts?categories=${attributes.selectedCategory}&sticky=${attributes.featured}&per_page=12`;
		} else {
			fetchPostUrl = `${attributes.apiUrl}wp/v2/posts?sticky=${attributes.featured}&per_page=12`;
		}
		await fetch(fetchPostUrl)
			.then((res) => res.json())
			.then(
				(result) => {
					setError(false);
					if (!Object.keys(result).length) {
						// if there are no featured posts in category - throw error
						setNoFeatured(true);
					} else {
						setNoFeatured(false);
						result.forEach(async (element) => {
							const el = {};
							await fetch(
								`${attributes.apiUrl}wp/v2/media/${element.featured_media}`
							)
								.then((res) => res.json())
								.then(
									(result) => {
										el.img = result.source_url;
									},
									(error) => {
										setError(true);
										console.log(error);
									}
								);
							el.title = element.title.rendered;
							el.excerpt = element.excerpt.rendered;
							el.date = element.date.split("T")[0];
							el.link = element.link;
							setPosts((posts) => [...posts, el]);
						});
					}
				},
				(error) => {
					setError(true);
					console.log(error);
				}
			);
		setIsLoading(false);
	}

	// Show pickers
	const showColorPickerControls = (index) => {
		let tempArray = [...showColorPicker];
		// close other color settings
		if (tempArray[index] == false) {
			tempArray = [false, false, false];
		}
		tempArray[index] = !tempArray[index];
		setShowColorPicker(tempArray);
	};

	// Apply Color changes
	const onChangeColor = (index, newColor) => {
		switch (index) {
			case 0:
				return setAttributes({ headlineColor: newColor });
			case 1:
				return setAttributes({ textColor: newColor });
			default:
				return;
		}
	};

	// update API url onChange for better UX
	const updateUrl = (event) => {
		const checkUrl = event.target.value.replace(/ /g, "");
		setAttributes({ apiUrl: checkUrl });
		setReload(true);
	};

	// update slider settings
	const changePostsCount = (event) => {
		if (event.target.value > 0) {
			setAttributes({ postsCount: event.target.value });
		} else {
			setAttributes({ postsCount: 1 });
		}
	};

	//update category
	const onCategoryChange = (event) => {
		setAttributes({ selectedCategory: event.target.value });
	};

	// show dots count correctly for user
	const getShowDots = () => {
		let content = [];
		{
			for (let i = 0; i < attributes.postsCount; i++)
				content.push(<span className="slide-dot"></span>);
		}
		return content;
	};

	return (
		<div {...useBlockProps()}>
			{
				<InspectorControls>
					<div className="controls">
						<Heading>API url</Heading>
						<input
							className="w-100"
							type="text"
							name="apiUrl"
							value={attributes.apiUrl}
							onChange={updateUrl}
						/>
						<p>
							By default it is set to: <code>{attributes.siteUrl}</code>
						</p>
					</div>
					<div className="controls posts-cont">
						<Heading>Posts</Heading>
						<label for="postsCount">Posts count in slider:</label>
						<input
							type="number"
							id="postsCount"
							className="mb-2"
							value={attributes.postsCount}
							onChange={changePostsCount}
							min="1"
							max="12"
						/>
						<label for="category">From category:</label>
						<select
							name="category"
							id="category"
							className="mb-2"
							onChange={onCategoryChange}
						>
							<option value="0">All</option>
							{allCat.length > 0 ? (
								allCat.map((el, i) => {
									if (attributes.selectedCategory == el.id) {
										return (
											<option value={el.id} selected>
												{el.name}
											</option>
										);
									}
									return <option value={el.id}>{el.name}</option>;
								})
							) : (
								<option value="loading">Loading...</option>
							)}
						</select>
						<div className="controls-item">
							<input
								id="featured"
								type="checkbox"
								defaultChecked={attributes.featured}
								onChange={() =>
									setAttributes({ featured: !attributes.featured })
								}
							/>
							<label for="featured" className="button-text">
								Show only Featured posts
							</label>
						</div>
					</div>
					<div className="controls">
						<Heading>Colours</Heading>
						<button
							className="controls-item"
							onClick={() => showColorPickerControls(0)}
						>
							<span
								className="dot"
								style={{
									backgroundColor: attributes.headlineColor,
								}}
							></span>
							<span className="button-text">Headline text color</span>
						</button>

						<fieldset
							className={`${showColorPicker[0] ? "" : "hidden"} controls-color`}
						>
							<ColorPalette
								value={attributes.headlineColor}
								onChange={(e) => onChangeColor(0, e)}
								clearable={false}
							/>
						</fieldset>
						<button
							className="controls-item"
							onClick={() => showColorPickerControls(1)}
						>
							<span
								className="dot"
								style={{
									backgroundColor: attributes.textColor,
								}}
							></span>
							<span className="button-text">Text color</span>
						</button>

						<fieldset
							className={`${showColorPicker[1] ? "" : "hidden"} controls-color`}
						>
							<ColorPalette
								value={attributes.textColor}
								onChange={(e) => onChangeColor(1, e)}
								clearable={false}
							/>
						</fieldset>
					</div>
					<div className="controls">
						<Heading>Slider settings</Heading>
						<div className="controls-item">
							<input
								id="arrows"
								type="checkbox"
								defaultChecked={attributes.arrows}
								onChange={() => setAttributes({ arrows: !attributes.arrows })}
							/>
							<label for="arrows" className="button-text">
								Show arrow navigation
							</label>
						</div>
						<div className="controls-item">
							<input
								id="dots"
								type="checkbox"
								defaultChecked={attributes.dots}
								onChange={() => setAttributes({ dots: !attributes.dots })}
							/>
							<label for="dots" className="button-text">
								Show slider dots
							</label>
						</div>
					</div>
				</InspectorControls>
			}
			{isLoading && !isError && !noFeatured ? (
				<Spinner />
			) : isError ? (
				<p>Error: API url is invalid</p>
			) : noFeatured ? (
				<p>Error: No featured posts</p>
			) : (
				<>
					<div className="slideshow-container">
						<img src={previewImg} />

						<div className="text-container">
							<h2 style={{ color: attributes.headlineColor }}>
								{previewHeadline}
							</h2>
							<div
								style={{ color: attributes.textColor }}
								dangerouslySetInnerHTML={{ __html: previewText }}
							></div>
							<p style={{ color: attributes.textColor }}>{postDate}</p>
						</div>
						{attributes.arrows ? (
							<>
								<a class="prev">&#10094;</a>
								<a class="next">&#10095;</a>
							</>
						) : null}
					</div>
					{attributes.dots ? (
						<div className="dots-container">{getShowDots()}</div>
					) : null}
				</>
			)}
		</div>
	);
}
