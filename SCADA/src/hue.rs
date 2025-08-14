mod hue; 
async fn get_devices() {
let body = reqwest::get("https://www.rust-lang.org")
    .await?
    .text()
    .await?;

debug!("body = {body:?}");
}
