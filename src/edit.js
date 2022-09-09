import { useState, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	ColorPalette,
	InspectorControls,
} from "@wordpress/block-editor";
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

	useEffect(async () => {
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

	useEffect(() => {
		if (allCat.length > 0) {
			setIsLoading(false);
		}
	}, [allCat]);

	// update the preview when category is changed
	useEffect(() => {
		setIsLoading(true);
		// fetch latest post for preview
		let fetchPostUrl = ``;
		if (attributes.selectedCategory != 0) {
			fetchPostUrl = `${attributes.apiUrl}wp/v2/posts?categories=${attributes.selectedCategory}`;
		} else {
			fetchPostUrl = `${attributes.apiUrl}wp/v2/posts`;
		}
		fetch(fetchPostUrl)
			.then((res) => res.json())
			.then(
				(result) => {
					setError(false);
					fetch(`${attributes.apiUrl}wp/v2/media/${result[0].featured_media}`)
						.then((res) => res.json())
						.then(
							(result) => {
								setError(false);
								setPreviewImg(result.source_url);
							},
							(error) => {
								setError(true);
								console.log(error);
							}
						);
					setPreviewHeadline(result[0].title.rendered);
					setPreviewText(result[0].excerpt.rendered);
					setIsLoading(false);
				},
				(error) => {
					setError(true);
					console.log(error);
				}
			);
	}, [attributes.selectedCategory]);

	// update the preview for "only featured"
	useEffect(() => {
		setIsLoading(true);
		// fetch latest post for preview
		let fetchPostUrl = ``;
		if (attributes.selectedCategory != 0) {
			fetchPostUrl = `${attributes.apiUrl}wp/v2/posts?categories=${attributes.selectedCategory}&sticky=${attributes.featured}`;
		} else {
			fetchPostUrl = `${attributes.apiUrl}wp/v2/posts?sticky=${attributes.featured}`;
		}
		console.log(fetchPostUrl);
		fetch(fetchPostUrl)
			.then((res) => res.json())
			.then(
				(result) => {
					setError(false);
					if (!Object.keys(result).length) {
						// if there are no featured posts in category - throw error
						setNoFeatured(true);
					} else {
						setNoFeatured(false);
						fetch(`${attributes.apiUrl}wp/v2/media/${result[0].featured_media}`)
							.then((res) => res.json())
							.then(
								(result) => {
									setError(false);
									setPreviewImg(result.source_url);
								},
								(error) => {
									setError(true);
									console.log(error);
								}
							);
						setPreviewHeadline(result[0].title.rendered);
						setPreviewText(result[0].excerpt.rendered);
						setIsLoading(false);
					}
				},
				(error) => {
					setError(true);
					console.log(error);
				}
			);
	}, [attributes.featured]);

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

	// Apply checkbox changes
	const checkboxChange = (index) => {
		switch (index) {
			case 0:
				return setAttributes({ arrows: !attributes.arrows });
			case 1:
				return setAttributes({ dots: !attributes.dots });
			case 2:
				return setAttributes({ featured: !attributes.featured });
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
								onChange={(e) => checkboxChange(2)}
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
								onChange={(e) => checkboxChange(0)}
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
								onChange={(e) => checkboxChange(1)}
							/>
							<label for="dots" className="button-text">
								Show slider dots
							</label>
						</div>
					</div>
				</InspectorControls>
			}
			{isLoading && !isError && !noFeatured ? (
				<p>Loading...</p>
			) : isError ? (
				<p>Error: API url is invalid</p>
			) : noFeatured ? (
				<p>Error: No featured posts</p>
			) : (
				<>
					<div className="slideshow-container">
						<div>
							<img src={previewImg} />
							<div style={{ color: attributes.headlineColor }}>
								{previewHeadline}
							</div>
							<div
								style={{ color: attributes.textColor }}
								dangerouslySetInnerHTML={{ __html: previewText }}
							></div>
						</div>
					</div>
					<div className="center">
						<span className="dot"></span>
						<span className="dot"></span>
						<span className="dot"></span>
					</div>
				</>
			)}
		</div>
	);
}
