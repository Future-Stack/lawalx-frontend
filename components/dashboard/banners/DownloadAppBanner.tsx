import Image from "next/image";

const DownloadAppBanner = () => {
    return (
        <div
            className="relative mb-6 flex flex-col md:flex-row items-center justify-between overflow-hidden"
            style={{
                padding: '8px',
                borderRadius: '20px',
                border: '1px solid var(--Border, #D4D4D4)',
                background: 'linear-gradient(180deg, rgba(15, 166, 255, 0.10) -7.42%, rgba(236, 151, 207, 0.10) 100%), var(--Section-Background, #FFF)',
            }}
        >
            {/* Left Content */}
            <div className="flex-1 p-6 md:p-10">
                <h2
                    className="mb-2"
                    style={{
                        color: 'var(--Headings, #171717)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '24px',
                        fontWeight: 600,
                        lineHeight: 'normal',
                    }}
                >
                    Download Our Mobile App
                </h2>
                <p
                    className="mb-8 max-w-[500px]"
                    style={{
                        color: 'var(--Body-Texts, #404040)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '20px',
                    }}
                >
                    This blog post has been published. Team members will be able to edit and publish the changes.
                </p>

                <div className="flex flex-wrap gap-4">
                    <a href="#" className="hover:opacity-80 transition-opacity">
                        <Image
                            src="/addLogo/app-store.png"
                            alt="Download on the App Store"
                            width={120}
                            height={40}
                            style={{ width: '119.664px', height: '40px' }}
                            className="h-[40px] w-auto"
                        />
                    </a>
                    <a href="#" className="hover:opacity-80 transition-opacity">
                        <Image
                            src="/addLogo/google-play.png"
                            alt="Get it on Google Play"
                            width={120}
                            height={40}
                            style={{ width: '119.664px', height: '40px' }}
                            className="h-[40px] w-auto"
                        />
                    </a>
                </div>
            </div>

            {/* Right Image */}
            <div className="relative w-full md:w-auto mt-4 md:mt-0 px-6 md:px-0">
                <div className="rounded-xl overflow-hidden md:mr-4 mb-4 md:mb-0">
                    <Image
                        src="/addLogo/add-right.png"
                        alt="Mobile App Mockup"
                        width={400}
                        height={200}
                        className="object-cover w-full md:w-[400px] h-auto rounded-xl"
                    />
                </div>
            </div>
        </div>
    );
};

export default DownloadAppBanner;
