## Get video info for embed (format can be "xml")

https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=SjJs4VhvMy0

## Get thumb of video, if thumb is not exists - we get smaller image

https://img.youtube.com/vi/SjJs4VhvMy0/0.jpg

# Get video mp4 file for download

1. Open video page
2. Find INNERTUBE_API_KEY
3. Do request to https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_API_KEY} with proper POST body
4. Find in response streamingData.adaptiveFormats
