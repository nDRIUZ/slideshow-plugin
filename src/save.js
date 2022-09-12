import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const posts = attributes.posts;

	// show dots count correctly for user
	const getShowDots = () => {
		let content = [];
		{
			for (let i = 0; i < attributes.postsCount; i++)
				content.push(
					<span className="slide-dot" onClick={`currentSlide(${i + 1})`}></span>
				);
		}
		return content;
	};

	return (
		<div className="m-w">
			<div className="slideshow-container" id="slideshow-container">
				{posts.map((value, index) => {
					return (
						<div className="slide fade">
							<img src={value.img} draggable="false" />

							<div className="text-container">
								<h2 style={{ color: attributes.headlineColor }}>
									{value.title}
								</h2>
								<div
									style={{ color: attributes.textColor }}
									dangerouslySetInnerHTML={{ __html: value.excerpt }}
								></div>
								<p style={{ color: attributes.textColor }}>{value.date}</p>
								<a href={value.link}>Read more</a>
							</div>

							{attributes.arrows ? (
								<>
									<a class="prev" onClick="plusSlides(-1)">
										&#10094;
									</a>
									<a class="next" onClick="plusSlides(1)">
										&#10095;
									</a>
								</>
							) : null}
						</div>
					);
				})}
				{attributes.dots ? (
					<div className="dots-container">{getShowDots()}</div>
				) : null}
			</div>
		</div>
	);
}
